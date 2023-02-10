import type { DictionaryDefinitionInline } from '@cspell/cspell-types';

import { createInlineSpellingDictionary } from './createInlineSpellingDictionary';

describe('Validate createSpellingDictionary', () => {
    test('createInlineSpellingDictionary', () => {
        const words = ['one', 'two', 'three', 'left-right'];
        const def: DictionaryDefinitionInline = {
            name: 'test-dict',
            words,
        };
        const d = createInlineSpellingDictionary(def, __filename);
        words.forEach((w) => expect(d.has(w)).toBe(true));
    });
});
