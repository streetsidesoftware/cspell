import type { Headers } from 'node-fetch';
import nodeFetch from 'node-fetch';

export const fetch = nodeFetch;

export async function fetchHead(request: string | URL): Promise<Headers> {
    const r = await fetch(request, { method: 'HEAD' });
    return r.headers;
}
