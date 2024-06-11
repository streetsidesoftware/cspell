import path from 'node:path';
import { pathToFileURL } from 'node:url';

import * as urlLib from '@cspell/url';

import { srcDirectory } from '../../lib-cjs/pkg-info.cjs';

export { addTrailingSlash, isDataURL, isFileURL, toFileDirURL, toFilePathOrHref, toURL } from '@cspell/url';

/**
 * This is a URL that can be used for searching for modules.
 * @returns URL for the source directory
 */
export function getSourceDirectoryUrl(): URL {
    const srcDirectoryURL = pathToFileURL(path.join(srcDirectory, '/'));
    return srcDirectoryURL;
}

/**
 * @param path - path to convert to a URL
 * @param relativeTo - URL to resolve the path against or the current working directory.
 * @returns a URL
 */
export function relativeTo(path: string, relativeTo?: URL | string): URL {
    return urlLib.toFileURL(path, relativeTo ?? cwdURL());
}

export function cwdURL(): URL {
    return pathToFileURL('./');
}

export function resolveFileWithURL(file: string | URL, relativeToURL: URL): URL {
    return urlLib.toFileURL(file, relativeToURL);
}

export function toFileUrl(file: string | URL): URL {
    return resolveFileWithURL(file, cwdURL());
}

export function fileURLOrPathToPath(filenameOrURL: string | URL): string {
    return urlLib.toFilePathOrHref(filenameOrURL);
}

export function isURLLike(url: string | URL): boolean {
    return urlLib.isUrlLike(url);
}

export function windowsDriveLetterToUpper(absoluteFilePath: string): string {
    return absoluteFilePath.replace(/^([a-z]):\\/, (s) => s.toUpperCase());
}
