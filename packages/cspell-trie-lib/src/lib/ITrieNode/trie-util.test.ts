import { describe, expect, test } from 'vitest';

import { trieRootToITrieRoot } from '../TrieNode/trie.js';
import { createTrieFromList } from '../TrieNode/trie-util.js';
import { mergeDefaults } from '../utils/mergeDefaults.js';
import { countNodes, countWords, findNode, has, iteratorTrieWords } from './trie-util.js';

describe('Validate Util Functions', () => {
    const trieNode = createTrieFromList(words);
    const trie = trieRootToITrieRoot(trieNode);

    test('createTriFromList', () => {
        expect(has(trie, 'sample')).toBe(true);
        expect(has(trie, 'not found')).toBe(false);
    });

    test('has', () => {
        // cspell:ignore sampl
        expect(has(trie, 'sample')).toBe(true);
        expect(has(trie, 'sampl')).toBe(false);
    });

    test('find', () => {
        expect(has(trie, 'sample')).toBe(true);
        // cspell:ignore sampl samp
        const n0 = findNode(trie, 'sample');
        const n1 = findNode(trie, 'sampl');
        const n2 = findNode(trie, 'samp');
        expect(n0?.eow).toBeTruthy();
        expect(n1?.get('e')).toBe(n0);
        expect(n2?.get('l')).toBe(n1);
    });

    test('countNodes', () => {
        expect(countNodes(trie)).toBe(73);
    });

    test('countWords', () => {
        expect(countWords(trie)).toBe(19);
    });

    test('iteratorTrieWords', () => {
        expect([...iteratorTrieWords(trie)].join(' ')).toBe(
            'These There are some someone sample space spaces. words worry. with for everyone extra to use, complete is no'
        );
    });

    test('mergeDefaults', () => {
        const a = { a: 1, b: 'b', c: 'c' };
        const b = { a: 3, b: 'bb' };

        expect(mergeDefaults(a, b)).toEqual({ a: 1, b: 'b' });
        expect(mergeDefaults(b, a)).toEqual({ a: 3, b: 'bb', c: 'c' });
    });
});

const sentence =
    'These are some sample words for everyone to use, complete with extra    spaces. There is no space for someone to worry.';
const words = sentence.split(' ');
