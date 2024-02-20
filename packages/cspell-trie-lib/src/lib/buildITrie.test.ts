import { describe, expect, test } from 'vitest';

import { buildITrieFromWords } from './buildITrie.js';

describe('buildITrie', () => {
    test('buildITrieFromWords', () => {
        const words = 'one two three'.split(' ');
        const trie = buildITrieFromWords(words, {});
        expect([...trie.words()]).toEqual(words);
    });
});
