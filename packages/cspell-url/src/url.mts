const isURLRegEx = /^(\w[\w-]{1,63}:\/|data:|stdin:)/i;

/**
 * Try to make a URL.
 * @param url
 * @param relativeTo - optional URL, if given, url will be parsed as relative.
 * @returns a URL
 */
export function toURL(url: string | URL, relativeTo?: string | URL): URL {
    return url instanceof URL ? url : new URL(url, relativeTo);
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
