/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { Headers, RequestInit, Response } from 'node-fetch';
import nodeFetch from 'node-fetch';

import { FetchUrlError } from './FetchError.js';

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

export function fetch(url: string | URL, init?: RequestInit): Promise<Response> {
    /// This is a n issue with how TypeScript handles packages without `type` being set.
    // @ts-ignore
    return nodeFetch(url, init);
}
