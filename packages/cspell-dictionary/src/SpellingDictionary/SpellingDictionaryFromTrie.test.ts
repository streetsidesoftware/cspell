import { buildITrieFromWords } from 'cspell-trie-lib';
import { describe, expect, test } from 'vitest';

import { __testing__, SpellingDictionaryFromTrie } from './SpellingDictionaryFromTrie.js';

const { outerWordForms } = __testing__;

// cspell:ignore guenstig günstig Bundesstaat Bundeßtaat
// cspell:ignore Goerresstraße, Goerreßtraße, Görresstraße, Görreßtraße

describe('SpellingDictionaryFromTrie', () => {
    test.each`
        word               | repMap                                                  | expected
        ${'hello'}         | ${undefined}                                            | ${['hello']}
        ${'guenstig'}      | ${[['ae', 'ä'], ['oe', 'ö'], ['ue', 'ü'], ['ss', 'ß']]} | ${['guenstig', 'günstig']}
        ${'günstig'}       | ${[['ae', 'ä'], ['oe', 'ö'], ['ue', 'ü'], ['ss', 'ß']]} | ${['günstig', N('günstig')]}
        ${'Bundesstaat'}   | ${[['ae', 'ä'], ['oe', 'ö'], ['ue', 'ü'], ['ss', 'ß']]} | ${['Bundesstaat', 'Bundeßtaat']}
        ${'Goerresstraße'} | ${[['ae', 'ä'], ['oe', 'ö'], ['ue', 'ü'], ['ss', 'ß']]} | ${['Goerresstraße', 'Goerreßtraße', 'Görresstraße', 'Görreßtraße']}
    `('outerWordForms $word', ({ word, repMap, expected }) => {
        const trie = buildITrieFromWords([]);
        const dict = new SpellingDictionaryFromTrie(trie, 'test', { repMap });
        const mapWord = dict.remapWord || ((a) => [dict.mapWord(a)]);
        expect(outerWordForms(word, mapWord)).toEqual(new Set(expected));
    });
});

function N(s: string, mode: 'NFD' | 'NFC' = 'NFD') {
    return s.normalize(mode);
}
