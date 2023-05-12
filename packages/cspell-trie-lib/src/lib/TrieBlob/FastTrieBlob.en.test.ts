import { opSkip, opTake, pipe } from '@cspell/cspell-pipe/sync';
import { describe, expect, test } from 'vitest';

import { readTrie } from '../../test/dictionaries.test.helper.js';
import { FastTrieBlob } from './FastTrieBlob.js';

function getTrie() {
    return readTrie('@cspell/dict-en_us/cspell-ext.json');
}

describe('Validate English FastTrieBlob', async () => {
    const pTrie = getTrie();
    const sampleTrie = await pTrie;
    const sampleWordsLarge = [...pipe(sampleTrie.words(), opSkip(1000), opTake(6000))];
    const fastTrieBlob = FastTrieBlob.fromTrieRoot(sampleTrie.root);

    test('insert', () => {
        const words = sampleWordsLarge;
        const ft = new FastTrieBlob();
        ft.insert(words);
        const result = [...ft.words()];
        expect(result).toEqual(words);
    });

    test('has', () => {
        const words = sampleWordsLarge;
        for (const word of words) {
            expect(fastTrieBlob.has(word)).toBe(true);
        }
    });
});
