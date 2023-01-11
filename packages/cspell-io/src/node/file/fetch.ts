import type { Headers } from 'node-fetch';
import nodeFetch from 'node-fetch';

import { FetchUrlError } from './FetchError';

export const fetch = nodeFetch;

export async function fetchHead(request: string | URL): Promise<Headers> {
    const r = await fetch(request, { method: 'HEAD' });
    return r.headers;
}

export async function fetchURL(url: URL): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) {
        throw FetchUrlError.create(url, response.status);
    }
    return Buffer.from(await response.arrayBuffer());
}
