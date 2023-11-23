import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

import { srcDirectory } from '../../lib-cjs/pkg-info.cjs';

const isUrlRegExp = /^(?:\w+:\/\/|data:)/i;

/**
 * Convert a URL into a string. If it is a file URL, convert it to a path.
 * @param url - URL
 * @returns path or href
 */
export function toFilePathOrHref(url: URL | string): string {
    return fileURLOrPathToPath(url);
}

/**
 * This is a URL that can be used for searching for modules.
 * @returns URL for the source directory
 */
export function getSourceDirectoryUrl(): URL {
    const base = pathToFileURL(srcDirectory);
    const srcDirectoryURL = new URL(base.pathname + '/', base);
    return srcDirectoryURL;
}

/**
 * @param path - path to convert to a URL
 * @param relativeTo - URL to resolve the path against or the current working directory.
 * @returns a URL
 */
export function relativeTo(path: string, relativeTo?: URL | string): URL {
    return new URL(normalizePathSlashesForUrl(path), relativeTo || cwdURL());
}

export function cwdURL(): URL {
    return pathToFileURL(process.cwd() + '/');
}

export function resolveFileWithURL(file: string | URL, relativeToURL: URL): URL {
    if (file instanceof URL) return file;
    if (isURLLike(file)) return toURL(file);
    const isRelativeToFile = isFileURL(relativeToURL);
    if (isRelativeToFile && path.isAbsolute(file)) {
        return pathToFileURL(file);
    }
    if (isRelativeToFile) {
        const rootURL = new URL('.', relativeToURL);
        const root = fileURLToPath(rootURL);
        const suffix = file === '.' || file == '..' || file.endsWith('/') || file.endsWith(path.sep) ? '/' : '';
        const filePath = path.resolve(root, file);
        return pathToFileURL(filePath + suffix);
    }

    return relativeTo(file, relativeToURL);
}

export function normalizePathSlashesForUrl(filePath: string, sep = path.sep): string {
    return filePath
        .replace(/^([a-z]:)/i, '/$1')
        .split(sep)
        .join('/');
}

export function toFileUrl(file: string | URL): URL {
    if (file instanceof URL) return file;
    return resolveFileWithURL(file, cwdURL());
}

export function toURL(href: string | URL, relativeTo?: string | URL): URL {
    return href instanceof URL ? href : new URL(href, relativeTo);
}

export function fileURLOrPathToPath(filenameOrURL: string | URL): string {
    return isFileURL(filenameOrURL) ? fileURLToPath(filenameOrURL) : filenameOrURL.toString();
}

export function isURLLike(url: string | URL): boolean {
    return url instanceof URL || isUrlRegExp.test(url);
}

export function isFileURL(url: string | URL): boolean {
    return isUrlWithProtocol(url, 'file');
}

export function isDataURL(url: string | URL): boolean {
    return isUrlWithProtocol(url, 'data');
}

function isUrlWithProtocol(url: string | URL, protocol: string): boolean {
    protocol = protocol.endsWith(':') ? protocol : protocol + ':';
    return url instanceof URL ? url.protocol === protocol : url.startsWith(protocol);
}
