import assert from 'node:assert';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { isUrlLike } from './url.mjs';

const isWindows = process.platform === 'win32';

const isWindowsPathRegEx = /^[a-z]:[\\/]/i;

const percentRegEx = /%/g;
const backslashRegEx = /\\/g;
const newlineRegEx = /\n/g;
const carriageReturnRegEx = /\r/g;
const tabRegEx = /\t/g;
const questionRegex = /\?/g;
const hashRegex = /#/g;

/**
 * @param url - URL or string to check if it is a file URL.
 * @returns true if the URL is a file URL.
 */
export function isFileURL(url: URL | string): boolean {
    return typeof url === 'string' ? url.startsWith('file:') : url.protocol === 'file:';
}

export interface PathInterface {
    sep: string;
    resolve(...paths: string[]): string;
}

export interface BuilderOptions {
    windows?: boolean | undefined;
    path?: PathInterface | undefined;
    cwd?: URL | undefined;
}

export class FileUrlBuilder {
    private windows: boolean;
    private path: PathInterface;
    private cwd: URL;
    constructor(options: BuilderOptions = {}) {
        const sep = options.path?.sep;
        this.windows = options.windows ?? (sep ? sep === '\\' : undefined) ?? isWindows;
        this.path = options.path ?? this.windows ? path.win32 : path.posix;
        this.cwd = options.cwd ?? pathToFileURL(this.path.resolve());
        assert(this.path.sep === (this.windows ? '\\' : '/'));
    }

    /**
     * Encode special characters in a file path to use in a URL.
     * @param filepath
     * @returns
     */
    encodePathChars(filepath: string) {
        filepath = filepath.replaceAll(percentRegEx, '%25');
        // In posix, backslash is a valid character in paths:
        if (!this.windows && filepath.includes('\\')) filepath = filepath.replaceAll(backslashRegEx, '%5C');
        filepath = filepath.replaceAll(newlineRegEx, '%0A');
        filepath = filepath.replaceAll(carriageReturnRegEx, '%0D');
        filepath = filepath.replaceAll(tabRegEx, '%09');
        return filepath;
    }

    /**
     * Normalize a file path for use in a URL.
     * ```js
     * const url = new URL(normalizeFilePathForUrl('path\\to\\file.txt'), 'file:///Users/user/');
     * // Result: file:///Users/user/path/to/file.txt
     * ```
     * @param filePath
     * @returns a normalized file path for use as a relative path in a URL.
     */
    normalizeFilePathForUrl(filePath: string): string {
        filePath = this.encodePathChars(filePath);
        filePath = filePath.replaceAll(questionRegex, '%3F');
        filePath = filePath.replaceAll(hashRegex, '%23');
        const pathname = filePath.replaceAll('\\', '/');
        return pathname.replace(isWindowsPathRegEx, (drive) => `/${drive}`.toLowerCase());
    }

    /**
     * Try to make a file URL.
     * - if filenameOrUrl is already a URL, it is returned as is.
     * @param filenameOrUrl
     * @param relativeTo - optional URL, if given, filenameOrUrl will be parsed as relative.
     * @returns a URL
     */
    toFileURL(filenameOrUrl: string | URL, relativeTo?: string | URL): URL {
        if (typeof filenameOrUrl !== 'string') return filenameOrUrl;
        if (isUrlLike(filenameOrUrl)) return new URL(filenameOrUrl);
        relativeTo ??= this.cwd;
        if (isUrlLike(relativeTo)) {
            return new URL(this.normalizeFilePathForUrl(filenameOrUrl), relativeTo);
        }
        // Resolve removes the trailing slash, so we need to add it back.
        const appendSlash = filenameOrUrl.endsWith('/')
            ? '/'
            : this.windows && filenameOrUrl.endsWith('\\')
              ? '\\'
              : '';
        return pathToFileURL(this.path.resolve(relativeTo.toString(), filenameOrUrl) + appendSlash);
    }
}

const fileUrlBuilder = new FileUrlBuilder();

export function encodePathChars(filepath: string) {
    return fileUrlBuilder.encodePathChars(filepath);
}

/**
 * Normalize a file path for use in a URL.
 * ```js
 * const url = new URL(normalizeFilePathForUrl('path\\to\\file.txt'), 'file:///Users/user/');
 * // Result: file:///Users/user/path/to/file.txt
 * ```
 * @param filePath
 * @returns a normalized file path for use as a relative path in a URL.
 */
export function normalizeFilePathForUrl(filePath: string): string {
    return fileUrlBuilder.normalizeFilePathForUrl(filePath);
}

/**
 * Try to make a file URL.
 * - if filenameOrUrl is already a URL, it is returned as is.
 * -
 * @param filenameOrUrl
 * @param relativeTo - optional URL, if given, filenameOrUrl will be parsed as relative.
 * @returns a URL
 */
export function toFileURL(filenameOrUrl: string | URL, relativeTo?: string | URL): URL {
    return fileUrlBuilder.toFileURL(filenameOrUrl, relativeTo);
}
