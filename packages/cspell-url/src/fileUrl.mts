import { fileURLToPath, pathToFileURL } from 'node:url';

import { hasProtocol } from './url.mts';

export const isWindows: boolean = process.platform === 'win32';

const windowsUrlPathRegExp = /^\/[a-zA-Z]:\//;

export function isWindowsPathnameWithDriveLatter(pathname: string): boolean {
    return windowsUrlPathRegExp.test(pathname);
}

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
            if (!isWindowsPathnameWithDriveLatter(u.pathname)) {
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

export const regExpWindowsPathDriveLetter: RegExp = /^([a-zA-Z]):[\\/]/;

export function pathWindowsDriveLetterToUpper(absoluteFilePath: string): string {
    return absoluteFilePath.replace(regExpWindowsPathDriveLetter, (s) => s.toUpperCase());
}

const regExpWindowsFileUrl = /^file:\/\/\/[a-zA-Z]:\//;

/**
 * Test if a url is a file url with a windows path. It does check for UNC paths.
 * @param url - the url
 * @returns true if the url is a file url with a windows path with a drive letter.
 */
export function isWindowsFileUrl(url: URL | string): boolean {
    return regExpWindowsFileUrl.test(url.toString());
}

export const uncLongPathPrefix = '\\\\?\\';
export const uncLongPathPrefixAlt = '\\\\.\\'; // Note this does not work in Node.js, but it is a valid long path prefix in Windows.

const uncWithLongPathPrefix = uncLongPathPrefix + 'UNC\\';
const uncWithLongPathPrefixAlt = uncLongPathPrefixAlt + 'UNC\\';

export function isUncPath(path: string): boolean {
    return path.startsWith('\\\\');
}

export function hasLongPathPrefix(path: string): boolean {
    return path.startsWith(uncLongPathPrefix);
}

export function hasLongPathPrefixAlt(path: string): boolean {
    return path.startsWith(uncLongPathPrefixAlt);
}

function addLongPathPrefixForce(path: string): string {
    if (hasLongPathPrefix(path)) return path;
    if (hasLongPathPrefixAlt(path)) {
        return fixLongPathPrefix(path);
    }
    if (isUncPath(path)) {
        return uncWithLongPathPrefix + path.slice(2);
    }
    return uncLongPathPrefix + path;
}

/**
 * Add the long path prefix to a path if it is not already present. This is needed to access paths longer than 260 characters on Windows.
 * This function uses the standard long path prefix (`\\?\UNC\` for UNC paths and `\\?\` for local paths).
 *
 * For non-windows platforms, this function returns the path unchanged.
 * @param path
 * @returns the path with the long path prefix added if needed.
 */
export function addLongPathPrefix(path: string): string {
    if (!isWindows) return path;
    return addLongPathPrefixForce(path);
}

function addLongPathPrefixAltForce(path: string): string {
    if (hasLongPathPrefix(path) || hasLongPathPrefixAlt(path)) return path;
    if (isUncPath(path)) {
        return uncWithLongPathPrefixAlt + path.slice(2);
    }
    return uncLongPathPrefixAlt + path;
}

/**
 * Add the long path prefix to a path if it is not already present. This is needed to access paths longer than 260 characters on Windows.
 * This function uses the alternative long path prefix (`\\.\UNC\` for UNC paths and `\\.\` for local paths). Note: Node.js does not support `\\.\` directly; call fixLongPathPrefix(...) before using the path with fs/pathToFileURL.
 *
 * For non-windows platforms, this function returns the path unchanged.
 * @param path
 * @returns the path with the long path prefix added if needed.
 */
export function addLongPathPrefixAlt(path: string): string {
    if (!isWindows) return path;
    return addLongPathPrefixAltForce(path);
}

/**
 * If the path has the long path unc prefix (`\\.\`), replace it with the standard long path prefix (`\\?\`). This is needed to access paths longer than 260 characters on Windows.
 * @param path - any path that may or may not have the long path prefix.
 * @returns the path with the standard long path prefix if needed.
 */
export function fixLongPathPrefix(path: string): string {
    if (!hasLongPathPrefixAlt(path)) return path;
    return uncLongPathPrefix + path.slice(uncLongPathPrefixAlt.length);
}
