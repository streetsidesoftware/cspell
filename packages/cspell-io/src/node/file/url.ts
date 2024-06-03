import path from 'node:path';
import { pathToFileURL } from 'node:url';

const isZippedRegExp = /\.gz($|[?#])/i;

const isURLRegExp = /^([\w-]{2,64}:\/|data:)/i;
const isWindowsPath = /^[a-z]:[\\/]/i;
const supportedProtocols: Record<string, true | undefined> = { 'file:': true, 'http:': true, 'https:': true };

export function isZipped(filename: string | URL): boolean {
    const path = typeof filename === 'string' ? filename : filename.pathname;
    return isZippedRegExp.test(path);
}
export function isUrlLike(filename: string | URL): boolean {
    return filename instanceof URL || isURLRegExp.test(filename);
}
export function isSupportedURL(url: URL): boolean {
    return !!supportedProtocols[url.protocol];
}
export function isFileURL(url: URL): boolean {
    return url.protocol === 'file:';
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
    if (typeof filenameOrUrl !== 'string') return filenameOrUrl;
    return isUrlLike(filenameOrUrl)
        ? new URL(filenameOrUrl)
        : relativeTo && isUrlLike(relativeTo)
          ? new URL(normalizePathForUrl(filenameOrUrl), relativeTo)
          : relativeTo
            ? pathToFileURL(path.resolve(relativeTo.toString(), filenameOrUrl))
            : pathToFileURL(filenameOrUrl);
}

/**
 * Try to make a URL.
 * @param filenameOrUrl
 * @param relativeTo - optional URL, if given, filenameOrUrl will be parsed as relative.
 * @returns a URL
 */
export function toURL(filenameOrUrl: string | URL, relativeTo?: string | URL): URL {
    return filenameOrUrl instanceof URL ? filenameOrUrl : new URL(filenameOrUrl, relativeTo);
}

const regMatchFilename = /filename=([^;,]*)/;

/**
 * Try to determine the base name of a URL.
 * @param url
 * @returns the base name of a URL, including the trailing `/` if present.
 */
export function urlBasename(url: string | URL): string {
    function guessDataUrlName(header: string): string {
        const filenameMatch = header.match(regMatchFilename);
        if (filenameMatch) return filenameMatch[1];
        const mime = header.split(';', 1)[0];
        return mime.replaceAll(/\W/g, '.');
    }

    url = toURL(url);

    if (url.protocol === 'data:') {
        return guessDataUrlName(url.pathname.split(',', 1)[0]);
    }
    const suffix = url.pathname.endsWith('/') ? '/' : '';
    return basename(url.pathname) + suffix;
}

/**
 * Try to determine the parent directory URL of the uri.
 * If it is not a hierarchical URL, then it will return the URL.
 * @param url - url to extract the dirname from.
 * @returns a URL
 */
export function urlDirname(url: string | URL): URL {
    url = toURL(url);
    if (url.protocol === 'data:') {
        return url;
    }

    try {
        return new URL(url.pathname.endsWith('/') ? '..' : '.', url);
    } catch {
        return url;
    }
}

/**
 * return the basename of a path, removing the trailing `/` if present.
 * @param path
 * @returns
 */
export function basename(path: string): string {
    path = path.endsWith('/') ? path.slice(0, -1) : path;
    const idx = path.lastIndexOf('/');
    return idx >= 0 ? path.slice(idx + 1) : path;
}

export function normalizePathForUrl(filePath: string): string {
    const pathname = filePath.replaceAll('\\', '/');
    const raw = pathname.replace(isWindowsPath, '/$&');
    return raw
        .split('/')
        .map(encodeURIComponent)
        .join('/')
        .replace(/^\/([a-z])%3A/i, '/$1:');
}
