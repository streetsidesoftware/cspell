import { describe, expect, test } from 'vitest';

import { fetchHead, fetchURL } from './fetch.js';
// import {} from './_fetch.js';

const timeout = 20000;

const testOptions = { timeout };

describe('fetch', () => {
    test(
        'fetch url',
        async () => {
            const url = new URL('https://example.com/');
            const response = await fetch(url);
            expect(response.ok).toBe(true);
            expect(await response.text()).toMatch('Example Domain');
        },
        testOptions,
    );

    test(
        'fetchURL',
        async () => {
            const url = new URL('https://example.com/');
            const response = await fetchURL(url);
            expect(response).toBeInstanceOf(Buffer);
        },
        testOptions,
    );

    /*
    test.each`
        url
        ${'https://example.com/'}
        ${'https://raw.githubusercontent.com/streetsidesoftware/cspell/main/packages/cspell-io/samples/cities.txt'}
        ${'https://raw.githubusercontent.com/streetsidesoftware/cspell/main/packages/cspell-io/samples/cities.txt.gz'}
        ${'https://raw.githubusercontent.com/streetsidesoftware/cspell/main/tsconfig.json'}
    `('fetchHead $url', async ({ url }) => {
        const response = await fetchHead(url);
        // console.log('%o', toObj(response));
        expect(response.get('etag')).toEqual(expect.any(String));
        expect(Number.parseInt(response.get('content-length') || '', 10)).toBeGreaterThan(0);
    }, testOptions);
    */

    test.each`
        url
        ${'https://example.com/'}
    `(
        'fetchHead $url',
        async ({ url }) => {
            const response = await fetchHead(url);
            // console.log('%o', toObj(response));
            expect(response.get('etag')).toEqual(expect.any(String));
            expect(Number.parseInt(response.get('content-length') || '', 10)).toBeGreaterThan(0);
        },
        testOptions,
    );

    test.each`
        url                                | expected
        ${'https://x.example.com/'}        | ${'getaddrinfo ENOTFOUND x.example.com'}
        ${'https://www.google.com/404'}    | ${/URL not found|getaddrinfo EAI_AGAIN/}
        ${'http://httpbin.org/status/503'} | ${'Fatal Error'}
    `(
        'fetchURL with error',
        async ({ url, expected }) => {
            url = new URL(url);
            await expect(fetchURL(url)).rejects.toThrowError(expected);
        },
        testOptions,
    );
});

// function toObj(m: Iterable<[string, string]>): Record<string, string> {
//     const r: Record<string, string> = {};
//     for (const entry of m) {
//         r[entry[0]] = entry[1];
//     }
//     return r;
// }
