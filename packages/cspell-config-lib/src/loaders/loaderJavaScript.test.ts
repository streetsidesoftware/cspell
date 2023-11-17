import { pathToFileURL } from 'url';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { CSpellConfigFileJson } from '../CSpellConfigFile/CSpellConfigFileJson.js';
import { defaultIO } from '../defaultIO.js';
import { fixtures } from '../test-helpers/fixtures.js';
import { loaderJavaScript } from './loaderJavaScript.js';

const oc = expect.objectContaining;

describe('loaderJavaScript', () => {
    afterEach(() => {});

    test.each`
        file                               | expected
        ${'js/module/cspell.config.js'}    | ${{ settings: oc({ id: 'module/js' }) }}
        ${'js/module/cspell.config.cjs'}   | ${{ settings: oc({ id: 'module/cjs' }) }}
        ${'js/commonjs/cspell.config.js'}  | ${{ settings: oc({ id: 'commonjs/js' }) }}
        ${'js/commonjs/cspell.config.mjs'} | ${{ settings: oc({ id: 'commonjs/mjs' }) }}
    `('loaderJavaScript $file', async ({ file, expected }) => {
        const url = pathToFileURL(fixtures(file));
        expected.url ??= url;
        const next = vi.fn();

        const result = await loaderJavaScript.load({ url, context: { deserialize, io: defaultIO } }, next);
        expect(result).toEqual(expected);
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
    return new CSpellConfigFileJson(params.url, JSON.parse(params.content), vi.fn());
}
