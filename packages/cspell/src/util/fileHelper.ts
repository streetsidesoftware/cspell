import * as cspell from 'cspell-lib';
import * as fsp from 'fs-extra';
import getStdin from 'get-stdin';
import { GlobOptions, globP } from './glob';
import * as path from 'path';
import { CSpellUserSettings, Document, fileToDocument, Issue } from 'cspell-lib';
import { IOError, toApplicationError, toError } from './errors';
import { mergeAsyncIterables } from './async';
import { readStdin } from './stdin';

const UTF8: BufferEncoding = 'utf8';
const STDIN = 'stdin';

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
    locale: string | undefined
): Document {
    const { filename, text } = fileInfo;
    languageId = languageId || undefined;
    locale = locale || undefined;

    if (filename === STDIN) {
        return {
            uri: 'stdin:///',
            text,
            languageId,
            locale,
        };
    }
    return fileToDocument(filename, text, languageId, locale);
}

interface ReadFileInfoResult extends FileInfo {
    text: string;
}

export function readFileInfo(
    filename: string,
    encoding: string = UTF8,
    handleNotFound = false
): Promise<ReadFileInfoResult> {
    const pText = filename === STDIN ? getStdin() : fsp.readFile(filename, encoding);
    return pText.then(
        (text) => ({ text, filename }),
        (e) => {
            const error = toError(e);
            return handleNotFound && error.code === 'EISDIR'
                ? Promise.resolve({ text: '', filename, errorCode: error.code })
                : handleNotFound && error.code === 'ENOENT'
                ? Promise.resolve({ text: '', filename, errorCode: error.code })
                : Promise.reject(new IOError(`Error reading file: "${filename}"`, error));
        }
    );
}

export function readFile(filename: string, encoding: string = UTF8): Promise<string> {
    return readFileInfo(filename, encoding).then((info) => info.text);
}

/**
 * Looks for matching glob patterns or stdin
 * @param globPatterns patterns or stdin
 */
export async function findFiles(globPatterns: string[], options: GlobOptions): Promise<string[]> {
    const globPats = globPatterns.filter((filename) => filename !== STDIN);
    const stdin = globPats.length < globPatterns.length ? [STDIN] : [];
    const globResults = globPats.length ? await globP(globPats, options) : [];
    const cwd = options.cwd || process.cwd();
    return stdin.concat(globResults.map((filename) => path.resolve(cwd, filename)));
}

export function calcFinalConfigInfo(
    configInfo: ConfigInfo,
    settingsFromCommandLine: CSpellUserSettings,
    filename: string,
    text: string
): FileConfigInfo {
    const ext = path.extname(filename);
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
        settingsFromCommandLine
    );
    const languageIds = settings.languageId ? [settings.languageId] : cspell.getLanguagesForExt(ext);
    const config = cspell.constructSettingsForText(settings, text, languageIds);
    return {
        configInfo: { ...configInfo, config },
        filename,
        text,
        languageIds,
    };
}

/**
 * Read
 * @param listFiles - array of file paths to read that will contain a list of files. Paths contained in each
 *   file will be resolved relative to the containing file.
 * @returns - a list of files to be processed.
 */
export async function readFileListFiles(listFiles: string[]): Promise<string[] | AsyncIterable<string>> {
    let useStdin = false;
    const files = listFiles.filter((file) => {
        const isStdin = file === 'stdin';
        useStdin = useStdin || isStdin;
        return !isStdin;
    });
    const found = flatten(await Promise.all(files.map(readFileListFile)));
    // Move `stdin` to the end.
    return useStdin ? mergeAsyncIterables(found, readStdin()) : found;
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

function flatten(fileLists: string[][]): string[] {
    function* f() {
        for (const list of fileLists) {
            yield* list;
        }
    }

    return [...f()];
}
