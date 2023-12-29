import { pathToFileURL } from 'url';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { CSpellConfigFileJson } from '../CSpellConfigFile/CSpellConfigFileJson.js';
import { defaultIO } from '../defaultIO.js';
import { fixtures } from '../test-helpers/fixtures.js';
import { loaderJavaScript } from './loaderJavaScript.js';

const oc = expect.objectContaining;
const ac = expect.arrayContaining;

describe('loaderJavaScript', () => {
    afterEach(() => {});

    test.each`
        file                               | expected
        ${'js/module/cspell.config.js'}    | ${{ settings: oc({ id: 'module/js' }) }}
        ${'js/module/cspell.config.cjs'}   | ${{ settings: oc({ id: 'module/cjs' }) }}
        ${'js/commonjs/cspell.config.js'}  | ${{ settings: oc({ id: 'commonjs/js' }) }}
        ${'js/commonjs/cspell.config.mjs'} | ${{ settings: oc({ id: 'commonjs/mjs' }) }}
        ${'js/module/cspell.custom.js'}    | ${{ settings: oc({ id: 'async-module', dictionaryDefinitions: [oc({ words: ac(['recheck', 'tested']) })] }) }}
    `('loaderJavaScript $file', async ({ file, expected }) => {
        const url = pathToFileURL(fixtures(file));
        expected.url ??= url;
        const next = vi.fn();

        const result = await loaderJavaScript.load({ url, context: { deserialize, io: defaultIO } }, next);
        expect(result).toEqual(expected);

        // Try double loading.
        const result2 = await loaderJavaScript.load({ url, context: { deserialize, io: defaultIO } }, next);
        expect(result2.settings).toBe(result.settings);

        // Ensure that we can force a load by changing search params.
        const url3 = new URL(url.href);
        url3.searchParams.append('q', '29');

        const result3 = await loaderJavaScript.load({ url: url3, context: { deserialize, io: defaultIO } }, next);
        expect(result3.settings).not.toBe(result.settings);
        expect(result3.settings).toEqual(result.settings);

        // Ensure that we can force a load by changing the hash.
        const url4 = new URL(url.href);
        url4.hash = 'hash';
        const result4 = await loaderJavaScript.load({ url: url4, context: { deserialize, io: defaultIO } }, next);
        expect(result4.settings).not.toBe(result.settings);
    });

    test.each`
        file                              | expected
        ${'js/module/cspell.function.js'} | ${{ settings: oc({ id: 'config-function', words: ac(['recheck', 'tested']) }) }}
    `('loaderJavaScript $file default function', async ({ file, expected }) => {
        const url = pathToFileURL(fixtures(file));
        expected.url ??= url;
        const next = vi.fn();

        const result = await loaderJavaScript.load({ url, context: { deserialize, io: defaultIO } }, next);
        expect(result).toEqual(expected);

        // Try double loading.
        const result2 = await loaderJavaScript.load({ url, context: { deserialize, io: defaultIO } }, next);
        expect(result2.settings).toEqual(result.settings);
        // These are not the same because it is a function result, not a static object.
        expect(result2.settings).not.toBe(result.settings);

        // Ensure that we can force a load by changing search params.
        const url3 = new URL(url.href);
        url3.searchParams.append('q', '29');

        const result3 = await loaderJavaScript.load({ url: url3, context: { deserialize, io: defaultIO } }, next);
        expect(result3.settings).not.toBe(result.settings);
        expect(result3.settings).toEqual(result.settings);

        // Ensure that we can force a load by changing the hash.
        const url4 = new URL(url.href);
        url4.hash = 'hash';
        const result4 = await loaderJavaScript.load({ url: url4, context: { deserialize, io: defaultIO } }, next);
        expect(result4.settings).not.toBe(result.settings);
    });

    test.each`
        file                               | expected
        ${'js/commonjs/cspell.config.mjs'} | ${{ settings: oc({ id: 'commonjs/mjs' }) }}
    `('loaderJavaScript reloading $file', async ({ file, expected }) => {
        const url = pathToFileURL(fixtures(file));
        expected.url ??= url;
        const next = vi.fn();

        const result = await loaderJavaScript.load({ url, context: { deserialize, io: defaultIO } }, next);
        expect(result).toEqual(expected);

        // Try double loading.
        const result2 = await loaderJavaScript.load({ url, context: { deserialize, io: defaultIO } }, next);
        expect(result2.settings).toBe(result.settings);

        // Ensure that we can force a load
        loaderJavaScript.reset();

        const result3 = await loaderJavaScript.load({ url, context: { deserialize, io: defaultIO } }, next);
        expect(result3.settings).not.toBe(result.settings);
        expect(result3.settings).toEqual(result.settings);
    });

    test.each`
        url
        ${'file:///cspell.json'}
    `('loaderJavaScript next', async ({ url }) => {
        const next = vi.fn();
        await loaderJavaScript.load({ url: new URL(url), context: { deserialize, io: defaultIO } }, next);
        expect(next).toHaveBeenCalledTimes(1);
    });
});

function deserialize(params: { url: URL; content: string }): CSpellConfigFileJson {
    return new CSpellConfigFileJson(params.url, JSON.parse(params.content));
}
