import { FileUrlBuilder } from './FileUrlBuilder.mjs';

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

/**
 * Converts a file path to a URL and adds a trailing slash.
 * @param dir - url to a directory
 * @returns a URL
 */
export function toFileDirURL(dir: string | URL): URL {
    return fileUrlBuilder.toFileDirURL(dir);
}
