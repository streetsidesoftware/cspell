import assert from 'node:assert';

import type { CSpellSettings } from '@cspell/cspell-types';
import { describe, test } from 'mocha';

import {
    type CSpellOptions,
    defaultOptions,
    defineCSpellConfig,
    defineCSpellPluginOptions,
    type Options,
} from './options.cjs';

describe('options', () => {
    test('Options are compatible with cspell-types', () => {
        const options: Options = { ...defaultOptions, cspell: { words: ['word'] } };
        assert(options.cspell);
        const settings: CSpellSettings = options.cspell;
        assert(settings, 'it is expected to compile.');
    });

    test('Make sure `language` is allowed.', () => {
        const options: Options = { ...defaultOptions, cspell: { language: 'en-gb' } };
        assert(options.cspell);
        const settings: CSpellSettings = options.cspell;
        assert(settings, 'it is expected to compile.');
    });

    test('defineCSpellPluginOptions', () => {
        // identity
        const options: Partial<Options> = defineCSpellPluginOptions({
            cspell: { words: ['word'] },
            autoFix: true,
            generateSuggestions: false,
            numSuggestions: 5,
        });
        assert(defineCSpellPluginOptions(options) === options, 'it is expected to be the same object.');
    });

    test('defineCSpellConfig', () => {
        // identity
        const config: CSpellOptions = defineCSpellConfig({
            words: ['word'],
        });
        assert(defineCSpellConfig(config) === config, 'it is expected to be the same object.');
    });
});
