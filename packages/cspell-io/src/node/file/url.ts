import { basenameOfUrlPathname } from '@cspell/url';

export {
    basenameOfUrlPathname,
    isFileURL,
    isURL,
    isUrlLike,
    toFileURL,
    toURL,
    urlBasename,
    urlParent as urlDirname,
} from '@cspell/url';

const isZippedRegExp = /\.gz($|[?#])/i;

const supportedProtocols: Record<string, true | undefined> = { 'file:': true, 'http:': true, 'https:': true };

export function isZipped(filename: string | URL): boolean {
    const path = typeof filename === 'string' ? filename : filename.pathname;
    return isZippedRegExp.test(path);
}

export function isSupportedURL(url: URL): boolean {
    return !!supportedProtocols[url.protocol];
}

/**
 * return the basename of a path, removing the trailing `/` if present.
 * @param path
 * @returns
 */
export function basename(path: string): string {
    const base = basenameOfUrlPathname(path);
    return base.endsWith('/') && !base.endsWith(':/') ? base.slice(0, -1) : base;
}
