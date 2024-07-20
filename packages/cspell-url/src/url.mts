const isURLRegEx = /^(\w[\w-]{1,63}:\/|data:|stdin:)/i;

/**
 * Try to make a URL.
 * @param url
 * @param relativeTo - optional URL, if given, url will be parsed as relative.
 * @returns a URL
 */
export function toURL(url: string | URL, relativeTo?: string | URL): URL {
    return normalizeWindowsUrl(url instanceof URL ? url : new URL(url, relativeTo));
}

/**
 * Try to determine the parent directory URL of the uri.
 * If it is not a hierarchical URL, then it will return the URL.
 * @param url - url to extract the dirname from.
 * @returns a URL
 */
export function urlParent(url: string | URL): URL {
    url = toURL(url);
    if (url.protocol === 'data:') {
        return url;
    }
    const hasTrailingSlash = url.pathname.endsWith('/');
    if (!url.pathname.startsWith('/')) {
        const parts = url.pathname.split('/').slice(0, hasTrailingSlash ? -2 : -1);
        let pathname = parts.join('/');
        pathname = (pathname && pathname + '/') || '';
        return new URL(url.protocol + (url.host ? '//' + url.host : '') + pathname + url.search + url.hash);
    }
    return new URL(hasTrailingSlash ? '..' : '.', url);
}

/**
 * Alias of {@link urlParent}
 * Try to determine the parent directory URL of the uri.
 * If it is not a hierarchical URL, then it will return the URL.
 * @param url - url to extract the dirname from.
 * @returns a URL
 */
export const urlDirname = urlParent;

/**
 * return the basename (last portion of the URL pathname) of a path. It does NOT remove the trailing slash.
 * @param path - URL pathname to extract the basename from.
 */
export function basenameOfUrlPathname(path: string): string {
    const adj = path.endsWith('/') ? 2 : 0;
    const idx = path.lastIndexOf('/', path.length - adj);
    return idx >= 0 ? path.slice(idx + 1) : path;
}

/**
 * @param filename - filename to check if it is a string containing a URL.
 */
export function isUrlLike(filename: string): boolean;
export function isUrlLike(filename: URL): true;
/**
 * @param filename - filename to check if it is a string containing a URL or a URL object.
 */
export function isUrlLike(filename: string | URL): boolean;
export function isUrlLike(filename: string | URL): boolean {
    return filename instanceof URL || isURLRegEx.test(filename);
}

/**
 * @param filename - filename to check if it is a string containing a URL.
 */
export function isNotUrlLike(filename: string): boolean;
export function isNotUrlLike(filename: URL): false;
/**
 * @param filename - filename to check if it is a string containing a URL or a URL object.
 */
export function isNotUrlLike(filename: string | URL): filename is string;
export function isNotUrlLike(filename: string | URL): boolean {
    return !isUrlLike(filename);
}

/**
 * Check if `url` is a URL instance.
 * @returns
 */
export function isURL(url: unknown): url is URL {
    return url instanceof URL;
}

/**
 *
 * @param url - url to check
 * @param protocol - protocol to check against - e.g. 'file:', 'http:', 'https:'
 * @returns
 */
export function hasProtocol(url: string | URL, protocol: string): boolean {
    protocol = protocol.endsWith(':') ? protocol : protocol + ':';
    return typeof url === 'string' ? url.startsWith(protocol) : url.protocol === protocol;
}

/**
 * Attempts to add a trailing slash to the URL pathname if it does not already have one.
 * Some If the pathname doesn't start with a `/`, a trailing slash is not added.
 * @param url - a URL
 * @returns
 */
export function addTrailingSlash(url: URL): URL {
    if (url.pathname.endsWith('/')) return url;
    const urlWithSlash = new URL(url.href);
    urlWithSlash.pathname += '/';
    return urlWithSlash;
}

/**
 * Remove the filename at the end of the URL pathname.
 * If the URL pathname ends with a `/`, it is considered a directory and the URL is returned as is.
 * If the URL pathname does not start with a `/`, it is considered an non-regular URL and the URL is returned as is.
 * @param url
 * @returns
 */
export function urlRemoveFilename(url: URL): URL {
    // Test if it is already a directory or it is not possible to remove the filename.
    if (url.pathname.endsWith('/') || !url.pathname.startsWith('/')) return url;
    return new URL('./', url);
}

/**
 * Extract the filename from the URL pathname.
 *
 * ```ts
 * url.href === new URL(urlFilename(url), urlRemoveFilename(url)).href
 * ```
 * @param url - URL to extract the filename from.
 * @returns the filename or empty string if the URL pathname ends with a `/`.
 */
export function urlFilename(url: URL): string {
    if (!url.pathname.startsWith('/')) return '';
    const lastSlash = url.pathname.lastIndexOf('/');
    return url.pathname.slice(lastSlash + 1);
}

/**
 * Calculate the relative path to go from `urlFrom` to `urlTo`.
 * The protocol is not evaluated. Only the `url.pathname` is used.
 * @param urlFrom
 * @param urlTo
 * @returns the relative path
 */
export function urlRelative(urlFrom: string | URL, urlTo: string | URL): string {
    return urlToUrlRelative(toURL(urlFrom), toURL(urlTo));
}

/**
 * Calculate the relative path to go from `urlFrom` to `urlTo`.
 * The protocol is not evaluated. Only the `url.pathname` is used.
 * @param urlFrom
 * @param urlTo
 * @returns the relative path
 */
export function urlToUrlRelative(urlFrom: URL, urlTo: URL): string {
    let pFrom = urlFrom.pathname;
    const pTo = urlTo.pathname;
    if (pFrom === pTo) return '';
    pFrom = pFrom.endsWith('/') ? pFrom : new URL('./', urlFrom).pathname;
    if (pTo.startsWith(pFrom)) return decodeURIComponent(pTo.slice(pFrom.length));
    const p0 = pFrom;
    const p1 = pTo;
    if (p1.startsWith(p0)) {
        return decodeURIComponent(p0 === p1 ? '' : p1.slice(p0.lastIndexOf('/') + 1));
    }
    const p0Parts = p0.split('/').slice(0, -1); // drop the last segment.
    const p1Parts = p1.split('/');
    let i = 0;
    for (i = 0; i < p0Parts.length && i < p1Parts.length - 1 && p0Parts[i] === p1Parts[i]; ++i) {
        // empty
    }
    const rel = '../'.repeat(p0Parts.length - i) + p1Parts.slice(i).join('/');
    return decodeURIComponent(rel.length < p1.length ? rel : p1);
}

export const regExpWindowsPath = /^[\\/]([a-zA-Z]:[\\/])/;
export const regExpEncodedColon = /%3[aA]/g;

/**
 * Ensure that a windows file url is correctly formatted with a capitol letter for the drive.
 *
 * @param url - URL to check.
 * @returns a new URL if modified or converted from a string.
 */
export function normalizeWindowsUrl(url: URL | string): URL {
    url = typeof url === 'string' ? new URL(url) : url;
    if (url.protocol === 'file:') {
        const pathname = url.pathname
            .replaceAll(regExpEncodedColon, ':')
            .replace(regExpWindowsPath, (d) => d.toUpperCase());
        if (pathname !== url.pathname) {
            url = new URL(url);
            url.pathname = pathname;
            return url;
        }
    }
    return url;
}
