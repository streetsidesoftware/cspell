import { basenameOfUrlPathname, hasProtocol, toURL } from './url.mjs';

const regMatchFilename = /filename=([^;,]*)/;
/**
 * Try to determine the base name of a URL.
 * @param url
 * @returns the base name of a URL, including the trailing `/` if present.
 */

export function urlBasename(url: string | URL): string {
    function guessDataUrlName(header: string): string {
        const filenameMatch = header.match(regMatchFilename);
        if (filenameMatch) return filenameMatch[1];
        const mime = header.split(';', 1)[0];
        return mime.replaceAll(/\W/g, '.');
    }

    url = toURL(url);

    if (url.protocol === 'data:') {
        return guessDataUrlName(url.pathname.split(',', 1)[0]);
    }
    return basenameOfUrlPathname(url.pathname);
}

export function isDataURL(url: string | URL): boolean {
    return hasProtocol(url, 'data:');
}
