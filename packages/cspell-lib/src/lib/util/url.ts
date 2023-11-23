import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

import { srcDirectory } from '../../lib-cjs/pkg-info.cjs';

/**
 * Convert a URL into a string. If it is a file URL, convert it to a path.
 * @param url - URL
 * @returns path or href
 */
export function toFilePathOrHref(url: URL | string): string {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol === 'file:') {
        return fileURLToPath(url);
    }
    return url.href;
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
export function relativeTo(path: string, relativeTo?: URL): URL {
    return new URL(normalizePathSlashesForUrl(path), relativeTo || cwdURL());
}

export function cwdURL(): URL {
    return pathToFileURL(process.cwd() + '/');
}

export function resolveFileWithURL(file: string | URL, relativeTo: URL): URL {
    if (file instanceof URL) return file;
    if (file.startsWith('file://')) return new URL(file);
    if (/^\w+:\/\//.test(file)) return new URL(file);
    if (relativeTo?.protocol === 'file:' && path.isAbsolute(file)) {
        return pathToFileURL(file);
    }
    return new URL(normalizePathSlashesForUrl(file), relativeTo);
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

export function toURL(href: string | URL): URL {
    return href instanceof URL ? href : new URL(href);
}
