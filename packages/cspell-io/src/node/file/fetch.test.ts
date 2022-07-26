import { fetch, fetchHead } from './fetch';

describe('fetch', () => {
    test('fetch url', async () => {
        const url = new URL('https://raw.githubusercontent.com/streetsidesoftware/cspell/main/tsconfig.json');
        const response = await fetch(url);
        expect(response.ok).toBe(true);
        expect(await response.text()).toMatch('$schema');
    });

    test.each`
        url
        ${'https://raw.githubusercontent.com/streetsidesoftware/cspell/main/packages/cspell-io/samples/cities.txt'}
        ${'https://raw.githubusercontent.com/streetsidesoftware/cspell/main/packages/cspell-io/samples/cities.txt.gz'}
        ${'https://raw.githubusercontent.com/streetsidesoftware/cspell/main/tsconfig.json'}
    `('fetchHead url', async ({ url }) => {
        const response = await fetchHead(url);
        // console.log('%o', toObj(response));
        expect(response.get('etag')).toMatch(/^W\//);
        expect(Number.parseInt(response.get('content-length') || '', 10)).toBeGreaterThan(0);
    });
});

// function toObj(m: Iterable<[string, string]>): Record<string, string> {
//     const r: Record<string, string> = {};
//     for (const entry of m) {
//         r[entry[0]] = entry[1];
//     }
//     return r;
// }
