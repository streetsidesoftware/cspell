import { pathToFileURL } from 'url';

const isZippedRegExp = /\.gz($|[?#])/i;

const isURLRegExp = /^\w{2,64}:\/\//i;
const supportedProtocols: Record<string, true | undefined> = { 'file:': true, 'http:': true, 'https:': true };

export function isZipped(filename: string | URL): boolean {
    const path = typeof filename === 'string' ? filename : filename.pathname;
    return isZippedRegExp.test(path);
}
export function isUrlLike(filename: string | URL): boolean {
    return filename instanceof URL || isURLRegExp.test(filename);
}
export function isSupportedURL(url: URL): boolean {
    return !!supportedProtocols[url.protocol];
}
export function isFileURL(url: URL): boolean {
    return url.protocol === 'file:';
}
export function toURL(filename: string | URL): URL {
    return filename instanceof URL || typeof filename !== 'string'
        ? filename
        : isUrlLike(filename)
        ? new URL(filename)
        : pathToFileURL(filename);
}
