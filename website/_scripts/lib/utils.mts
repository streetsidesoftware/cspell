import { URL_SITE_PKG } from './constants.mts';

export function relativeToUrl(url: URL | string, baseUrl: URL): string {
    const base = new URL('.', baseUrl).pathname.split('/');
    const path = new URL(url).pathname.split('/');

    let i = 0;
    for (; i < Math.min(base.length, path.length) && base[i] === path[i]; ++i) {
        // no code
    }

    let prefix = base
        .slice(i, -1)
        .map(() => '..')
        .join('/');
    prefix = prefix ? prefix + '/' : '';
    const suffix = path.slice(i).join('/');
    return prefix + suffix;
}

export function relativeToSite(url: URL | string): string {
    return relativeToUrl(url, URL_SITE_PKG);
}
