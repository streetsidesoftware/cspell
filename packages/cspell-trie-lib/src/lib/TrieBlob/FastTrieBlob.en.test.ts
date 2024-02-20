import { opSkip, opTake, pipe } from '@cspell/cspell-pipe/sync';
import { describe, expect, test } from 'vitest';

import { readTrieFromConfig } from '../../test/dictionaries.test.helper.js';
import { FastTrieBlobBuilder } from './FastTrieBlobBuilder.js';

function getTrie() {
    return readTrieFromConfig('@cspell/dict-en_us/cspell-ext.json');
}

describe('Validate English FastTrieBlob', async () => {
    const pTrie = getTrie();
    const sampleTrie = await pTrie;
    const sampleWordsLarge = [...pipe(sampleTrie.words(), opSkip(1000), opTake(6000))];
    const fastTrieBlob = FastTrieBlobBuilder.fromTrieRoot(sampleTrie.root);

    test('insert', () => {
        const words = sampleWordsLarge;
        const ft = FastTrieBlobBuilder.fromWordList(words);
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
