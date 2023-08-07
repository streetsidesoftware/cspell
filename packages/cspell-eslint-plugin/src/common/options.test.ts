import { describe, test } from 'mocha';

import { defaultOptions, type Options } from './options.js';
import type { CSpellSettings } from '@cspell/cspell-types';
import assert from 'assert';

describe('options', () => {
    test('Options are compatible with cspell-types', () => {
        const options: Options = { ...defaultOptions, cspell: { words: ['word'] } };
        assert(options.cspell);
        const settings: CSpellSettings = options.cspell;
        assert(true, 'it is expected to compile.');
    });
});
