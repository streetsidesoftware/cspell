import { describe, expect, test } from 'vitest';

import type { UnknownWordsConfiguration } from './CSpellSettingsDef.js';
import { unknownWordsOptions } from './CSpellSettingsDef.js';

describe('CSpellSettingsDef', () => {
    test('UnknownWordsConfiguration', () => {
        // This is a compile test.
        const config: UnknownWordsConfiguration = { unknownWords: unknownWordsOptions.ReportAll };
        expect(config).toBeDefined();
    });
});
