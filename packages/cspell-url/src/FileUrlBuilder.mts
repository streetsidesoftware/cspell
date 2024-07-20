import assert from 'node:assert';
import Path from 'node:path';
import { pathToFileURL } from 'node:url';

import { pathWindowsDriveLetterToUpper, regExpWindowsPathDriveLetter, toFilePathOrHref } from './fileUrl.mjs';
import {
    addTrailingSlash,
    isUrlLike,
    normalizeWindowsUrl,
    regExpWindowsPath,
    urlParent,
    urlToUrlRelative,
} from './url.mjs';

export const isWindows = process.platform === 'win32';

const isWindowsPathRegEx = regExpWindowsPathDriveLetter;
const isWindowsPathname = regExpWindowsPath;

export const percentRegEx = /%/g;
export const backslashRegEx = /\\/g;
export const newlineRegEx = /\n/g;
export const carriageReturnRegEx = /\r/g;
export const tabRegEx = /\t/g;
export const questionRegex = /\?/g;
export const hashRegex = /#/g;

export interface PathInterface {
    sep: string;
    resolve(...paths: string[]): string;
    parse(path: string): Path.ParsedPath;
    normalize(path: string): string;
    relative(from: string, to: string): string;
    isAbsolute(path: string): boolean;
}

export interface BuilderOptions {
    windows?: boolean | undefined;
    path?: PathInterface | undefined;
    cwd?: URL | undefined;
}

const ProtocolFile = 'file:';

export class FileUrlBuilder {
    private windows: boolean;
    readonly path: PathInterface;
    readonly cwd: URL;
    constructor(options: BuilderOptions = {}) {
        const sep = options.path?.sep;
        this.windows = options.windows ?? (sep ? sep === '\\' : undefined) ?? isWindows;
        this.path = options.path ?? (this.windows ? Path.win32 : Path.posix);
        // note: `this.path.resolve() + '/'` is used on purpose instead of `'./'`
        this.cwd = options.cwd ?? this.pathToFileURL(this.path.resolve() + '/', this.rootFileURL());
        assert(
            this.path.sep === (this.windows ? '\\' : '/'),
            `Path separator should match OS type Windows: ${this.windows === true ? 'true' : (this.windows ?? 'undefined') || 'false'}, ` +
                `sep: ${this.path.sep}, ` +
                `options: ` +
                JSON.stringify({
                    isWindows,
                    sep: `${sep}`,
                    windows: options.windows,
                    pathSep: options.path?.sep,
                    n: options.path?.normalize('path/file.txt'),
                    cwd: options.cwd?.href,
                    win32: this.path === Path.win32,
                    posix: this.path === Path.posix,
                    'win32.normalize': this.path.normalize === Path.win32.normalize,
                    'posix.normalize': this.path.normalize === Path.posix.normalize,
                }) +
                ``,
        );
    }

    /**
     * Encode special characters in a file path to use in a URL.
     * @param filepath
     * @returns
     */
    encodePathChars(filepath: string) {
        filepath = filepath.replaceAll(percentRegEx, '%25');
        // In posix, backslash is a valid character in paths:
        if (!this.windows && !isWindows && filepath.includes('\\')) {
            filepath = filepath.replaceAll(backslashRegEx, '%5C');
        }
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
        return normalizeWindowsUrl(this.#toFileURL(filenameOrUrl, relativeTo));
    }

    /**
     * Try to make a file URL.
     * - if filenameOrUrl is already a URL, it is returned as is.
     * @param filenameOrUrl
     * @param relativeTo - optional URL, if given, filenameOrUrl will be parsed as relative.
     * @returns a URL
     */
    #toFileURL(filenameOrUrl: string | URL, relativeTo?: string | URL): URL {
        if (typeof filenameOrUrl !== 'string') return filenameOrUrl;
        if (isUrlLike(filenameOrUrl)) return new URL(filenameOrUrl);
        relativeTo ??= this.cwd;
        isWindows && (filenameOrUrl = filenameOrUrl.replaceAll('\\', '/'));
        if (isUrlLike(relativeTo)) {
            const pathname = this.normalizeFilePathForUrl(filenameOrUrl);
            return new URL(pathname, relativeTo);
        }
        // Resolve removes the trailing slash, so we need to add it back.
        const appendSlash = filenameOrUrl.endsWith('/') ? '/' : '';
        const pathname =
            this.normalizeFilePathForUrl(this.path.resolve(relativeTo.toString(), filenameOrUrl)) + appendSlash;
        return this.pathToFileURL(pathname, this.cwd);
    }

    /**
     * Try to make a URL for a directory.
     * - if dirOrUrl is already a URL, a slash is appended to the pathname.
     * @param dirOrUrl - directory path to convert to a file URL.
     * @param relativeTo - optional URL, if given, filenameOrUrl will be parsed as relative.
     * @returns a URL
     */
    toFileDirURL(dirOrUrl: string | URL, relativeTo?: string | URL): URL {
        return addTrailingSlash(this.toFileURL(dirOrUrl, relativeTo));
    }

    urlToFilePathOrHref(url: URL | string): string {
        url = this.toFileURL(url);
        return this.#urlToFilePathOrHref(url);
    }

    #urlToFilePathOrHref(url: URL): string {
        if (url.protocol !== ProtocolFile) return url.href;
        const p =
            this.path === Path
                ? toFilePathOrHref(url)
                : decodeURIComponent(url.pathname.split('/').join(this.path.sep));
        return pathWindowsDriveLetterToUpper(p.replace(isWindowsPathname, '$1'));
    }

    /**
     * Calculate the relative path to go from `urlFrom` to `urlTo`.
     * The protocol is not evaluated. Only the `url.pathname` is used.
     * The result: `new URL(relative(urlFrom, urlTo), urlFrom).pathname === urlTo.pathname`
     * @param urlFrom
     * @param urlTo
     * @returns the relative path
     */
    relative(urlFrom: URL, urlTo: URL): string {
        if (urlFrom.protocol === urlTo.protocol && urlFrom.protocol === ProtocolFile) {
            if (urlFrom.href === urlTo.href) return '';
            urlFrom = urlFrom.pathname.endsWith('/') ? urlFrom : new URL('./', urlFrom);
            const fromPath = urlFrom.pathname;
            const toPath = urlTo.pathname;
            if (toPath.startsWith(fromPath)) return decodeURIComponent(toPath.slice(fromPath.length));
            const pFrom = this.#urlToFilePathOrHref(urlFrom);
            const pTo = this.#urlToFilePathOrHref(urlTo);
            const toIsDir = urlTo.pathname.endsWith('/');
            let pathname = this.normalizeFilePathForUrl(this.path.relative(pFrom, pTo));
            if (toIsDir && !pathname.endsWith('/')) pathname += '/';
            return decodeURIComponent(pathname);
        }
        return decodeURIComponent(urlToUrlRelative(urlFrom, urlTo));
    }

    /**
     * Get the parent directory of a URL.
     * @param url
     */
    urlDirname(url: URL | string): URL {
        return urlParent(this.toFileURL(url));
    }

    pathToFileURL(pathname: string, relativeToURL?: URL | string): URL {
        return new URL(this.normalizeFilePathForUrl(pathname), relativeToURL || this.cwd);
    }

    rootFileURL(filePath?: string): URL {
        const path = this.path;
        const p = path.parse(path.normalize(path.resolve(filePath ?? '.')));
        return new URL(this.normalizeFilePathForUrl(p.root), this.#getFsRootURL());
    }

    #getFsRootURL() {
        if (this.path === Path) return pathToFileURL('/');
        const p = this.path.resolve('/');
        return new URL(this.normalizeFilePathForUrl(p), 'file:///');
    }

    /**
     * Determine if a filePath is absolute.
     *
     * @param filePath
     * @returns true if `URL` or `path.isAbsolute(filePath)`
     */
    isAbsolute(filePath: string): boolean {
        return isUrlLike(filePath) || this.path.isAbsolute(filePath);
    }

    isUrlLike(url: string | URL): boolean {
        return isUrlLike(url);
    }
}
