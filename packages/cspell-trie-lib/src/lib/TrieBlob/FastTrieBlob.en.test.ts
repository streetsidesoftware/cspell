import { describe, expect, test } from 'vitest';

import { readTrie } from '../../test/dictionaries.test.helper.js';
import { FastTrieBlob } from './FastTrieBlob.js';
import { measure } from './test/perf.js';

function getTrie() {
    return readTrie('@cspell/dict-en_us/cspell-ext.json');
}

describe('Validate English FastTrieBlob', async () => {
    const pTrie = getTrie();
    const sampleTrie = await pTrie;
    const sampleWordsLarge = [...sampleTrie.words()];
    const fastTrieBlob = FastTrieBlob.create(sampleWordsLarge);

    test('insert', () => {
        const words = sampleWordsLarge.slice(1000, 6000);
        const ft = new FastTrieBlob();
        measure('FastTrieBlob', () => ft.insert(words));
        const result = [...ft.words()];
        expect(result).toEqual(words);
    });

    test('has', () => {
        const words = sampleWordsLarge.slice(1000, 6000);
        for (const word of words) {
            expect(fastTrieBlob.has(word)).toBe(true);
        }
    });
});
