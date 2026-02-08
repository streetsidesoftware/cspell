import { describe, expect, test } from 'vitest';

import { chopUrlAtNodeModules } from './WrappedProviderFs.js';

describe('chopUrlAtNodeModules', () => {
    test.each`
        url                                                                               | expected
        ${'cspell-vfs://test/file.txt'}                                                   | ${'cspell-vfs://test/file.txt'}
        ${'file:///cspell-io/node_modules/@cspell/dict-en/cspell-ext.json'}               | ${'file:///cspell-io/node_modules/@cspell/dict-en/cspell-ext.json'}
        ${'file:///cspell-io/node_modules/@cspell/cspell-service-bus/dist/esm/assert.js'} | ${'file:///cspell-io/node_modules/…/dist/esm/assert.js'}
    `('chopUrlAtNodeModules $url', ({ url, expected }) => {
        expect(chopUrlAtNodeModules(new URL(url))).toEqual(expected);
    });

    test('chopUrlAtNodeModules', () => {
        expect(chopUrlAtNodeModules(undefined)).toEqual('');
    });
});
