import { _fetch as fetch } from './_fetch.js';
import { FetchUrlError, toFetchUrlError } from './FetchError.js';

export async function fetchHead(request: string | URL): Promise<Headers> {
    const url = toURL(request);
    try {
        const r = await fetch(url, { method: 'HEAD' });
        if (!r.ok) {
            throw FetchUrlError.create(url, r.status);
        }
        return r.headers;
    } catch (e) {
        throw toFetchUrlError(e, url);
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
        throw toFetchUrlError(e, url);
    }
}

function toURL(url: string | URL): URL {
    return typeof url === 'string' ? new URL(url) : url;
}
