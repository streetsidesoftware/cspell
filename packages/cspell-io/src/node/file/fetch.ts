import { FetchUrlError, isError } from './FetchError.js';

export async function fetchHead(request: string | URL): Promise<Headers> {
    const url = toURL(request);
    try {
        const r = await fetch(url, { method: 'HEAD' });
        return r.headers;
    } catch (e) {
        // console.warn('fetchHead Error %o', e);
        if (isError(e)) {
            throw FetchUrlError.fromError(url, e);
        }
        throw e;
    }
}

export async function fetchURL(url: URL): Promise<Buffer> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw FetchUrlError.create(url, response.status);
        }
        return Buffer.from(await response.arrayBuffer());
    } catch (e) {
        // console.warn('fetchURL Error %o', e);
        if (e instanceof FetchUrlError) throw e;
        if (isError(e)) {
            throw FetchUrlError.fromError(url, e);
        }
        throw e;
    }
}

function toURL(url: string | URL): URL {
    return typeof url === 'string' ? new URL(url) : url;
}
