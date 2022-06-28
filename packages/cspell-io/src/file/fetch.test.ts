import { fetch } from './fetch';

describe('fetch', () => {
    test('fetch url', async () => {
        const url = new URL('https://raw.githubusercontent.com/streetsidesoftware/cspell/main/tsconfig.json');
        const response = await fetch(url);
        expect(response.ok).toBe(true);
        expect(await response.text()).toMatch('$schema');
    });
});
