import { promises as fsp } from 'node:fs';
import * as path from 'node:path';
import streamConsumers from 'node:stream/consumers';
import { fileURLToPath } from 'node:url';

import { toFileDirURL, toFileURL } from '@cspell/url';
import type { BufferEncoding } from 'cspell-io';
import { readFileText as cioReadFile, toURL } from 'cspell-io';
import type { Document } from 'cspell-lib';
import * as cspell from 'cspell-lib';
import { fileToDocument, isBinaryFile as isUriBinaryFile } from 'cspell-lib';

import { asyncAwait, asyncFlatten, asyncMap, asyncPipe, mergeAsyncIterables } from './async.js';
import { FileUrlPrefix, STDIN, STDINProtocol, STDINUrlPrefix, UTF8 } from './constants.js';
import { IOError, toApplicationError, toError } from './errors.js';
import type { GlobOptions } from './glob.js';
import { globP } from './glob.js';
import { readStdin } from './stdin.js';
import { isStdinUrl, resolveStdinUrl } from './stdinUrl.js';
import { clean } from './util.js';

export interface FileInfo {
    filename: string;
    text?: string;
    errorCode?: string;
}

export type Perf = cspell.SpellCheckFilePerf;

export function fileInfoToDocument(
    fileInfo: FileInfo,
    languageId: string | undefined,
    locale: string | undefined,
): Document {
    const { filename, text } = fileInfo;
    languageId = languageId || undefined;
    locale = locale || undefined;

    const uri = filenameToUrl(filename);

    if (uri.href.startsWith(STDINProtocol)) {
        return clean({
            uri: uri.href,
            text,
            languageId,
            locale,
        });
    }

    return fileToDocument(uri.href, text, languageId, locale);
}

export function filenameToUrl(filename: string | URL, cwd = '.'): URL {
    if (filename instanceof URL) return filename;
    const cwdURL = toFileDirURL(cwd);
    if (filename === STDIN) return new URL('stdin:///');
    if (isStdinUrl(filename)) {
        return new URL(resolveStdinUrl(filename, cwd));
    }
    return toFileURL(filename, cwdURL);
}

export function filenameToUri(filename: string, cwd?: string): URL {
    return toURL(filenameToUrl(filename, cwd));
}

export function isBinaryFile(filename: string, cwd?: string): boolean {
    const uri = filenameToUri(filename, cwd);
    if (uri.protocol.startsWith('stdin')) return false;
    return isUriBinaryFile(uri);
}

export interface ReadFileInfoResult extends FileInfo {
    text: string;
}

export function resolveFilename(filename: string, cwd?: string): string {
    cwd = cwd || process.cwd();
    if (filename === STDIN) return STDINUrlPrefix;
    if (filename.startsWith(FileUrlPrefix)) {
        const url = new URL(filename.slice(FileUrlPrefix.length), toFileDirURL(cwd));
        return fileURLToPath(url);
    }
    if (isStdinUrl(filename)) {
        return resolveStdinUrl(filename, cwd);
    }
    return path.resolve(cwd, filename);
}

export function readFileInfo(
    filename: string,
    encoding: BufferEncoding = UTF8,
    handleNotFound = false,
): Promise<ReadFileInfoResult> {
    filename = resolveFilename(filename);
    const pText = filename.startsWith(STDINProtocol)
        ? streamConsumers.text(process.stdin)
        : cioReadFile(filename, encoding);
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
        !isStdin(filename) && !filename.startsWith(FileUrlPrefix) ? true : (stdin.push(filename), false),
    );
    const globResults = globPats.length ? await globP(globPats, options) : [];
    const cwd = options.cwd || process.cwd();
    return [...stdin, ...globResults].map((filename) => resolveFilename(filename, cwd));
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

function isStdin(filename: string): boolean {
    return filename === STDIN || isStdinUrl(filename);
}

export async function isFile(filename: string): Promise<boolean> {
    if (isStdin(filename)) return true;
    try {
        const stat = await fsp.stat(filename);
        return stat.isFile();
    } catch {
        return false;
    }
}

export async function isDir(filename: string): Promise<boolean> {
    try {
        const stat = await fsp.stat(filename);
        return stat.isDirectory();
    } catch {
        return false;
    }
}

export function isNotDir(filename: string): Promise<boolean> {
    return isDir(filename).then((a) => !a);
}
