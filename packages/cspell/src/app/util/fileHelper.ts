import { readFileText as cioReadFile } from 'cspell-io';
import type { CSpellUserSettings, Document, Issue } from 'cspell-lib';
import * as cspell from 'cspell-lib';
import { fileToDocument, isBinaryFile as isUriBinaryFile } from 'cspell-lib';
import { promises as fsp } from 'fs';
import getStdin from 'get-stdin';
import * as path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { URI } from 'vscode-uri';

import { asyncAwait, asyncFlatten, asyncMap, asyncPipe, mergeAsyncIterables } from './async.js';
import { FileProtocol, STDIN, STDINProtocol, UTF8 } from './constants.js';
import { IOError, toApplicationError, toError } from './errors.js';
import type { GlobOptions } from './glob.js';
import { globP } from './glob.js';
import { readStdin } from './stdin.js';
import { clean } from './util.js';

const doesMatchUrl = /^(file|stdin|https?):\/\//;

export interface ConfigInfo {
    source: string;
    config: CSpellUserSettings;
}

export interface FileConfigInfo {
    configInfo: ConfigInfo;
    filename: string;
    text: string;
    languageIds: string[];
}

export async function readConfig(configFile: string | undefined, root: string | undefined): Promise<ConfigInfo> {
    if (configFile) {
        const config = (await cspell.loadConfig(configFile)) || {};
        return { source: configFile, config };
    }
    const config = await cspell.searchForConfig(root);
    return { source: config?.__importRef?.filename || 'None found', config: config || {} };
}

export interface FileInfo {
    filename: string;
    text?: string;
    errorCode?: string;
}
export interface FileResult {
    fileInfo: FileInfo;
    processed: boolean;
    issues: Issue[];
    errors: number;
    configErrors: number;
    elapsedTimeMs: number | undefined;
    cached?: boolean;
}

export function fileInfoToDocument(
    fileInfo: FileInfo,
    languageId: string | undefined,
    locale: string | undefined,
): Document {
    const { filename, text } = fileInfo;
    languageId = languageId || undefined;
    locale = locale || undefined;

    const uri = filenameToUrlString(filename);

    if (uri.startsWith(STDINProtocol)) {
        return clean({
            uri,
            text,
            languageId,
            locale,
        });
    }

    return fileToDocument(uri, text, languageId, locale);
}

export function filenameToUrlString(filename: string, cwd = '.'): string {
    if (filename === STDIN) return 'stdin:///';
    if (filename.startsWith(STDINProtocol)) {
        const filePath = filename.slice(STDINProtocol.length);
        const fullPath = path.resolve(cwd, filePath);
        return pathToFileURL(fullPath).toString();
    }
    if (doesMatchUrl.test(filename)) return filename;
    return pathToFileURL(path.resolve(cwd, filename)).toString();
}

export function filenameToUri(filename: string, cwd?: string): URI {
    return URI.parse(filenameToUrlString(filename, cwd));
}

export function isBinaryFile(filename: string, cwd?: string): boolean {
    const uri = filenameToUri(filename, cwd);
    if (uri.scheme.startsWith('stdin')) return false;
    return isUriBinaryFile(uri);
}

export interface ReadFileInfoResult extends FileInfo {
    text: string;
}

export function resolveFilename(filename: string, cwd?: string): string {
    cwd = cwd || process.cwd();
    if (filename === STDIN) return STDINProtocol;
    if (filename.startsWith(FileProtocol)) {
        const url = new URL(filename.slice(FileProtocol.length), pathToFileURL(cwd + path.sep));
        return fileURLToPath(url);
    }
    const scheme = filename.startsWith(STDINProtocol) ? STDINProtocol : '';
    const pathname = filename.slice(scheme.length);

    return scheme + path.resolve(cwd, pathname);
}

export function readFileInfo(
    filename: string,
    encoding: BufferEncoding = UTF8,
    handleNotFound = false,
): Promise<ReadFileInfoResult> {
    filename = resolveFilename(filename);
    const pText = filename.startsWith(STDINProtocol) ? getStdin() : cioReadFile(filename, encoding);
    return pText.then(
        (text) => ({ text, filename }),
        (e) => {
            const error = toError(e);
            return handleNotFound && error.code === 'EISDIR'
                ? Promise.resolve({ text: '', filename, errorCode: error.code })
                : handleNotFound && error.code === 'ENOENT'
                ? Promise.resolve({ text: '', filename, errorCode: error.code })
                : Promise.reject(new IOError(`Error reading file: "${filename}"`, error));
        },
    );
}

export function readFile(filename: string, encoding: BufferEncoding = UTF8): Promise<string> {
    return readFileInfo(filename, encoding).then((info) => info.text);
}

/**
 * Looks for matching glob patterns or stdin
 * @param globPatterns patterns or stdin
 */
export async function findFiles(globPatterns: string[], options: GlobOptions): Promise<string[]> {
    const stdin: string[] = [];
    const globPats = globPatterns.filter((filename) =>
        filename !== STDIN && !filename.startsWith(STDINProtocol) && !filename.startsWith(FileProtocol)
            ? true
            : (stdin.push(filename), false),
    );
    const globResults = globPats.length ? await globP(globPats, options) : [];
    const cwd = options.cwd || process.cwd();
    return [...stdin, ...globResults].map((filename) => resolveFilename(filename, cwd));
}

export function calcFinalConfigInfo(
    configInfo: ConfigInfo,
    settingsFromCommandLine: CSpellUserSettings,
    filename: string,
    text: string,
): FileConfigInfo {
    const basename = path.basename(filename);
    const fileSettings = cspell.calcOverrideSettings(configInfo.config, path.resolve(filename));
    const loadDefault =
        settingsFromCommandLine.loadDefaultConfiguration ??
        configInfo.config.loadDefaultConfiguration ??
        fileSettings.loadDefaultConfiguration ??
        true;
    const settings = cspell.mergeSettings(
        cspell.getDefaultSettings(loadDefault),
        cspell.getGlobalSettings(),
        fileSettings,
        settingsFromCommandLine,
    );
    const languageIds = settings.languageId
        ? Array.isArray(settings.languageId)
            ? settings.languageId
            : [settings.languageId]
        : cspell.getLanguageIdsForBaseFilename(basename);
    const config = cspell.constructSettingsForText(settings, text, languageIds);
    return {
        configInfo: { ...configInfo, config },
        filename,
        text,
        languageIds,
    };
}

const resolveFilenames = asyncMap(resolveFilename);

/**
 * Read
 * @param listFiles - array of file paths to read that will contain a list of files. Paths contained in each
 *   file will be resolved relative to the containing file.
 * @returns - a list of files to be processed.
 */
export function readFileListFiles(listFiles: string[]): AsyncIterable<string> {
    let useStdin = false;
    const files = listFiles.filter((file) => {
        const isStdin = file === 'stdin';
        useStdin = useStdin || isStdin;
        return !isStdin;
    });
    const found = asyncPipe(
        files,
        asyncMap((file) => readFileListFile(file)),
        asyncAwait(),
        asyncFlatten(),
    );
    // Move `stdin` to the end.
    const stdin = useStdin ? readStdin() : [];
    return asyncPipe(mergeAsyncIterables(found, stdin), resolveFilenames);
}

/**
 * Read a `listFile` and return the containing file paths resolved relative to the `listFile`.
 * @param listFiles - array of file paths to read that will contain a list of files. Paths contained in each
 *   file will be resolved relative to the containing file.
 * @returns - a list of files to be processed.
 */
export async function readFileListFile(listFile: string): Promise<string[]> {
    try {
        const relTo = path.resolve(path.dirname(listFile));
        const content = await readFile(listFile);
        const lines = content
            .split('\n')
            .map((a) => a.trim())
            .filter((a) => !!a)
            .map((file) => path.resolve(relTo, file));
        return lines;
    } catch (err) {
        throw toApplicationError(err, `Error reading file list from: "${listFile}"`);
    }
}

export async function isFile(filename: string): Promise<boolean> {
    try {
        const stat = await fsp.stat(filename);
        return stat.isFile();
    } catch (e) {
        return false;
    }
}

export async function isDir(filename: string): Promise<boolean> {
    try {
        const stat = await fsp.stat(filename);
        return stat.isDirectory();
    } catch (e) {
        return false;
    }
}

export function isNotDir(filename: string): Promise<boolean> {
    return isDir(filename).then((a) => !a);
}
