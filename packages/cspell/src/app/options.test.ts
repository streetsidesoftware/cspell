import { describe, expect, test } from 'vitest';

import { fixLegacy } from './options.js';

describe('options', () => {
    test.each`
        options                             | expected
        ${{}}                               | ${{}}
        ${{ local: 'en' }}                  | ${{ locale: 'en' }}
        ${{ locale: 'en' }}                 | ${{ locale: 'en' }}
        ${{ local: 'en', locale: 'en-gb' }} | ${{ locale: 'en-gb' }}
    `('fixLegacy', ({ options, expected }) => {
        expect(fixLegacy(options)).toEqual(expected);
    });
});
