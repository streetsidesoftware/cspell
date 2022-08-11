import { basename } from 'path/posix';
import { pathToFileURL } from 'url';

const isZippedRegExp = /\.gz($|[?#])/i;

const isURLRegExp = /^(\w{2,64}:\/\/|data:)/i;
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

const regMatchFilename = /filename=([^;,]*)/;

export function urlBasename(url: string | URL): string {
    function guessDataUrlName(header: string): string {
        const filenameMatch = header.match(regMatchFilename);
        if (filenameMatch) return filenameMatch[1];
        const mime = header.split(';', 1)[0];
        return mime.replace(/\W/g, '.');
    }

    if (typeof url === 'string' && url.startsWith('data:')) {
        return guessDataUrlName(url.split(',', 1)[0].split(':', 2)[1]);
    }
    url = toURL(url);
    if (url.protocol === 'data:') {
        return guessDataUrlName(url.pathname.split(',', 1)[0]);
    }

    return basename(url.pathname);
}

export function urlDirname(url: string | URL): URL {
    if (typeof url === 'string' && url.startsWith('data:')) {
        return toURL('data:');
    }
    url = toURL(url);
    if (url.protocol === 'data:') {
        return toURL('data:');
    }

    return new URL(url.pathname.endsWith('/') ? '..' : '.', url);
}
