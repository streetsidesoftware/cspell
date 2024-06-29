import { fileURLToPath } from 'node:url';

import { hasProtocol } from './url.mjs';

/**
 * @param url - URL or string to check if it is a file URL.
 * @returns true if the URL is a file URL.
 */
export function isFileURL(url: URL | string): boolean {
    return hasProtocol(url, 'file:');
}

/**
 * Convert a URL into a string. If it is a file URL, convert it to a path.
 * @param url - URL
 * @returns path or href
 */
export function toFilePathOrHref(url: URL | string): string {
    return isFileURL(url) ? toFilePath(url) : url.toString();
}

function toFilePath(url: string | URL): string {
    return windowsDriveLetterToUpper(fileURLToPath(url));
}

function windowsDriveLetterToUpper(absoluteFilePath: string): string {
    return absoluteFilePath.replace(/^([a-z]):\\/, (s) => s.toUpperCase());
}
