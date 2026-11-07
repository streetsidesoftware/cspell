import { describe, expect, test } from 'vitest';

import { buildITrieFromWords } from '../buildITrie.ts';
import type { ITrie } from '../ITrie.ts';

const words = [
    'Straße',
    'blue',
    'bell',
    'blåbær',
    'gross+',
    '+art',
    'wun+',
    '+derbar',
    '~berlin',
    'Berlin',
    '!forboden',
    'forboden',
    '𝒜bc',
];

const repMap: [string, string][] = [
    ['ss', 'ß'],
    ['ae', 'æ'],
    ['aa', 'å'],
    ['oe', 'ø'],
    ['ü', 'ue'],
    ['Z', 'B'],
    ['x', '𝒜'],
    ['q', 'nd'],
];

function createTrie(list: string[] = words, map: [string, string][] = repMap, ignore?: string): ITrie {
    return buildITrieFromWords(list).withReplacements(map, ignore);
}

describe('findWord following replacements in the walk', () => {
    test.each`
        word          | expected
        ${'Strasse'}  | ${'Straße'}
        ${'blaabaer'} | ${'blåbær'}
        ${'blaabær'}  | ${'blåbær'}
        ${'blåbaer'}  | ${'blåbær'}
        ${'blaabaeq'} | ${false}
        ${'xbc'}      | ${'𝒜bc'}
        ${'Zerlin'}   | ${'Berlin'}
    `('case sensitive $word', ({ word, expected }) => {
        expect(createTrie().findWord(word, { caseSensitive: true }).found).toBe(expected);
    });

    test('words stored without case are searched when case does not matter', () => {
        const trie = buildITrieFromWords(['~berlin']).withReplacements([['x', 'b']]);
        expect(trie.findWord('xerlin', { caseSensitive: false }).found).toBe('berlin');
        expect(trie.findWord('xerlin', { caseSensitive: false }).caseMatched).toBe(false);
        expect(trie.findWord('xerlin', { caseSensitive: true }).found).toBe(false);
    });

    test('compound words use the marker in the trie', () => {
        const trie = createTrie();
        expect(trie.findWord('wünderbar', { caseSensitive: true }).found).toBe(false);
        expect(trie.findWord('wuqerbar', { caseSensitive: true })).toEqual(
            expect.objectContaining({ found: 'wunderbar', compoundUsed: true }),
        );
    });

    test('a compound boundary can be inside a replacement', () => {
        const trie = buildITrieFromWords(['wun+', '+derbar']).withReplacements([['q', 'nd']]);
        expect(trie.findWord('wuqerbar', { caseSensitive: true }).found).toBe('wunderbar');
    });

    test('compound parts are not words by themselves', () => {
        const trie = buildITrieFromWords(['wun+', '+derbar']).withReplacements([['q', 'd']]);
        expect(trie.findWord('qerbar', { caseSensitive: true }).found).toBe(false);
    });

    test('legacy compounds need parts of the minimum length', () => {
        const trie = createTrie();
        const options = { useLegacyWordCompounds: true, caseSensitive: true };
        expect(trie.findWord('blaabaerblue', options).found).toBe('blåbær+blue');
        expect(trie.findWord('blueblaabaer', { ...options, useLegacyWordCompounds: 6 }).found).toBe(false);
    });

    test('a found form that is forbidden reports it', () => {
        const trie = buildITrieFromWords(['forboden', '!forboden']).withReplacements([['q', 'o']]);
        expect(trie.findWord('fqrbqden', { checkForbidden: true })).toEqual(
            expect.objectContaining({ found: 'forboden', forbidden: true }),
        );
        expect(trie.hasWord('fqrbqden', true)).toBe(false);
    });

    test('characters to ignore are removed', () => {
        const trie = createTrie(['phone'], [], '́');
        expect(trie.findWord('phoné', { caseSensitive: true }).found).toBe('phone');
    });

    test('finds a word with more forms than the limit of remapWord', () => {
        const stem = 'aaoe'.repeat(10);
        const trie = createTrie(['åø'.repeat(10)]);
        expect(trie.remapWord?.(stem).length).toBe(256);
        expect(trie.findWord(stem, { caseSensitive: true }).found).toBe('åø'.repeat(10));
    });

    test('a very long unknown word returns', () => {
        const trie = createTrie(['aa', 'a+', '+a', '+a+']);
        expect(trie.findWord('a'.repeat(20_000) + 'q', { caseSensitive: true }).found).toBe(false);
    });

    test('a very long compound word is found', () => {
        const trie = createTrie(['a+', '+a', '+a+'], [['q', 'a']]);
        const word = 'a'.repeat(20_000) + 'q';
        expect(trie.findWord(word, { caseSensitive: true }).found).toBe('a'.repeat(20_001));
    });

    test.each`
        word
        ${'blaabaer'}
        ${'BLAABAER'}
        ${'wuqerbar'}
        ${'grossart'}
        ${'grossarz'}
        ${'Zlue'}
        ${'xbcq'}
        ${'strasse'}
    `('accepts $word exactly when one of its forms is found', ({ word }) => {
        const trie = createTrie();
        const plain = buildITrieFromWords(words);
        for (const options of [
            { caseSensitive: true },
            { caseSensitive: false },
            { caseSensitive: true, useLegacyWordCompounds: true },
            { caseSensitive: false, useLegacyWordCompounds: true },
        ]) {
            const forms = trie.remapWord?.(word) || [];
            const expected = forms.some((form) => plain.findWord(form, options).found !== false);
            expect(trie.findWord(word, options).found !== false).toBe(expected);
        }
    });
});

// cspell:ignore aaoe blaabaeq blaabaer blaabaerblue blaabær blueblaabaer blåbaer blåbær derbar forboden fqrbqden grossart grossarz phoné qerbar Strasse Straße wunderbar wuqerbar wünderbar xbcq xerlin Zerlin Zlue
