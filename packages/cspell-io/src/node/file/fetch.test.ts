/* eslint-disable n/no-unsupported-features/node-builtins */
// eslint-disable-next-line simple-import-sort/imports
import createFetchMock from 'vitest-fetch-mock';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { fetchHead, fetchURL } from './fetch.js';
import { toFetchUrlError } from './FetchError.js';

// cspell:ignore dontMock

const mockFetch = createFetchMock(vi);

const useMockFetch = true;

const timeout = 20_000;

describe('fetch', () => {
    afterEach(() => {
        mockFetch.dontMock();
    });

    test(
        'fetchURL',
        async () => {
            const url = new URL('https://example.com/');
            const response = await doFetchUrl(url);
            expect(response).toBeInstanceOf(Uint8Array);
        },
        timeout,
    );

    /*
    test.each`
        url
        ${'https://example.com/'}
        ${'https://raw.githubusercontent.com/streetsidesoftware/cspell/main/packages/cspell-io/samples/cities.txt'}
        ${'https://raw.githubusercontent.com/streetsidesoftware/cspell/main/packages/cspell-io/samples/cities.txt.gz'}
        ${'https://raw.githubusercontent.com/streetsidesoftware/cspell/main/tsconfig.base.json'}
    `('fetchHead $url', async ({ url }) => {
        const response = await fetchHead(url);
        // console.log('%o', toObj(response));
        expect(response.get('etag')).toEqual(expect.any(String));
        expect(Number.parseInt(response.get('content-length') || '', 10)).toBeGreaterThan(0);
    }, testOptions);
    */

    test.each`
        url
        ${'http://www.jdentonthego.com/Pictures/Nepal/NP_EBC_D02_Small_Village.jpg'}
    `(
        'fetchHead $url',
        async ({ url }) => {
            const response = await fetchHead(url);
            // console.log('%o', toObj(response));
            expect(response.get('etag')).toEqual(expect.any(String));
            expect(Number.parseInt(response.get('content-length') || '', 10)).toBeGreaterThan(0);
        },
        timeout,
    );

    test.each`
        url                                   | expected
        ${'https://x.example.com/'}           | ${'getaddrinfo ENOTFOUND x.example.com'}
        ${'https://www.google.com/404'}       | ${/URL not found|getaddrinfo EAI_AGAIN/}
        ${'https://httpbingo.org/status/503'} | ${'Fatal Error'}
    `(
        'fetchURL with error',
        async ({ url, expected }) => {
            url = new URL(url);
            await expect(doFetchUrl(url)).rejects.toThrowError(expected);
        },
        timeout,
    );

    test('abort', async () => {
        const url = new URL('https://example.com/');
        const controller = new AbortController();
        const signal = controller.signal;
        controller.abort();
        await expect(fetchURL(url, signal)).rejects.toThrowError('This operation was aborted');
    });
});

// function toObj(m: Iterable<[string, string]>): Record<string, string> {
//     const r: Record<string, string> = {};
//     for (const entry of m) {
//         r[entry[0]] = entry[1];
//     }
//     return r;
// }

async function doFetchUrl(url: URL, signal?: AbortSignal): Promise<Uint8Array<ArrayBuffer>> {
    const mockResponse = getMockResponse(url);
    if (!mockResponse) {
        try {
            const req = signal ? new Request(url, { signal }) : url;
            const response = await fetch(req);
            const ok = response.ok;
            const status = response.status;
            const statusText = response.statusText;
            const body = await response.text();
            console.error('Response %o', { ok, status, body, statusText, url: response.url });
        } catch (e) {
            console.error('Response %o', { url: url.href, error: e });
        }
    }

    if (mockResponse && useMockFetch) {
        if (mockResponse instanceof Error) {
            mockFetch.mockReject(toFetchUrlError(mockResponse, url));
        } else {
            mockFetch.mockResponse(mockResponse);
        }
    }

    return fetchURL(url, signal);
}

function getMockResponse(url: URL) {
    const href = url.href;
    switch (href) {
        case 'https://httpbingo.org/status/503': {
            return {
                ok: false,
                status: 503,
                body: '',
                statusText: 'Service Unavailable',
                url: 'https://httpbingo.org/status/503',
            };
        }
        case 'https://www.google.com/404': {
            return {
                ok: false,
                status: 404,
                body:
                    '<!DOCTYPE html>\n' +
                    '<html lang=en>\n' +
                    '  <meta charset=utf-8>\n' +
                    '  <meta name=viewport content="initial-scale=1, minimum-scale=1, width=device-width">\n' +
                    '  <title>Error 404 (Not Found)!!1</title>\n' +
                    '  <style>\n' +
                    '  </style>\n' +
                    '  <a href=//www.google.com/><span id=logo aria-label=Google></span></a>\n' +
                    '  <p><b>404.</b> <ins>That’s an error.</ins>\n' +
                    '  <p>The requested URL <code>/404</code> was not found on this server.  <ins>That’s all we know.</ins>\n',
                statusText: 'Not Found',
                url: 'https://www.google.com/404',
            };
        }
        case 'https://x.example.com/': {
            return new Error('getaddrinfo ENOTFOUND x.example.com');
        }
        case 'https://example.com/': {
            return {
                ok: true,
                status: 200,
                body:
                    '<!doctype html>\n' +
                    '<html>\n' +
                    '<head>\n' +
                    '    <title>Example Domain</title>\n' +
                    '\n' +
                    '    <meta charset="utf-8" />\n' +
                    '    <meta http-equiv="Content-type" content="text/html; charset=utf-8" />\n' +
                    '    <meta name="viewport" content="width=device-width, initial-scale=1" />\n' +
                    '    <style type="text/css">\n' +
                    '    body {\n' +
                    '        background-color: #f0f0f2;\n' +
                    '        margin: 0;\n' +
                    '        padding: 0;\n' +
                    '        \n' +
                    '    }\n' +
                    '    div {\n' +
                    '        width: 600px;\n' +
                    '        margin: 5em auto;\n' +
                    '        padding: 2em;\n' +
                    '        background-color: #fdfdff;\n' +
                    '        border-radius: 0.5em;\n' +
                    '        box-shadow: 2px 3px 7px 2px rgba(0,0,0,0.02);\n' +
                    '    }\n' +
                    '    a:link, a:visited {\n' +
                    '        color: #38488f;\n' +
                    '        text-decoration: none;\n' +
                    '    }\n' +
                    '    @media (max-width: 700px) {\n' +
                    '        div {\n' +
                    '            margin: 0 auto;\n' +
                    '            width: auto;\n' +
                    '        }\n' +
                    '    }\n' +
                    '    </style>    \n' +
                    '</head>\n' +
                    '\n' +
                    '<body>\n' +
                    '<div>\n' +
                    '    <h1>Example Domain</h1>\n' +
                    '    <p>This domain is for use in illustrative examples in documents. You may use this\n' +
                    '    domain in literature without prior coordination or asking for permission.</p>\n' +
                    '    <p><a href="https://www.iana.org/domains/example">More information...</a></p>\n' +
                    '</div>\n' +
                    '</body>\n' +
                    '</html>\n',
                statusText: 'OK',
                url: 'https://example.com/',
            };
        }
    }
    return undefined;
}
