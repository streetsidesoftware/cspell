import { fileURLToPath, pathToFileURL } from 'node:url';

import { hasProtocol } from './url.mjs';

export const isWindows = process.platform === 'win32';

const windowsUrlPathRegExp = /^\/[a-zA-Z]:\//;

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
    return isFileURL(url) && url.toString().startsWith('file:///') ? toFilePath(url) : url.toString();
}

function toFilePath(url: string | URL): string {
    try {
        // Fix drive letter if necessary.
        if (isWindows) {
            const u = new URL(url);
            if (!windowsUrlPathRegExp.test(u.pathname)) {
                const cwdUrl = pathToFileURL(process.cwd());
                if (cwdUrl.hostname) {
                    return fileURLToPath(new URL(u.pathname, cwdUrl));
                }
                const drive = cwdUrl.pathname.split('/')[1];
                u.pathname = `/${drive}${u.pathname}`;
                return fileURLToPath(u);
            }
        }
        return pathWindowsDriveLetterToUpper(fileURLToPath(url));
    } catch {
        // console.error('Failed to convert URL to path', url);
        return url.toString();
    }
}

export const regExpWindowsPathDriveLetter = /^([a-zA-Z]):[\\/]/;

export function pathWindowsDriveLetterToUpper(absoluteFilePath: string): string {
    return absoluteFilePath.replace(regExpWindowsPathDriveLetter, (s) => s.toUpperCase());
}
