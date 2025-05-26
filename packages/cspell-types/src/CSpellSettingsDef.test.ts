import { describe, expect, test } from 'vitest';

import type { UnknownWordsConfiguration } from './CSpellReporter.js';
import { unknownWordsChoices } from './CSpellReporter.js';

describe('CSpellSettingsDef', () => {
    test('UnknownWordsConfiguration', () => {
        // This is a compile test.
        const config: UnknownWordsConfiguration = { unknownWords: unknownWordsChoices.ReportAll };
        expect(config).toBeDefined();
    });
});
