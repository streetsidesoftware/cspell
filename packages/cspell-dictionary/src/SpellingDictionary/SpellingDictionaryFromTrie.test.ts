import assert from 'node:assert';

import type { DictionaryDefinition, DictionaryDefinitionAugmented } from '@cspell/cspell-types';
import { buildITrieFromWords } from 'cspell-trie-lib';
import { describe, expect, test } from 'vitest';

import { readDictionaryDefinitions, readFile } from '../test/reader.test.helper.js';
import type { SpellingDictionaryOptions } from './SpellingDictionary.js';
import {
    __testing__,
    createSpellingDictionaryFromTrieFile,
    SpellingDictionaryFromTrie,
} from './SpellingDictionaryFromTrie.js';

const { outerWordForms } = __testing__;

// cspell:ignore guenstig günstig Bundesstaat Bundeßtaat
// cspell:ignore Goerresstraße, Goerreßtraße, Görresstraße, Görreßtraße Hoehenschnittpunkt Strasse Straße

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
        expect([...outerWordForms(word, dict.repMapper)]).toEqual([...new Set(expected)]);
    });

    test('has with German Dictionary to make sure remap works as expected', async () => {
        const dict = await readTrieDictionaryFromModules('@cspell/dict-de-de', 'de-de');
        expect(dict).toBeInstanceOf(SpellingDictionaryFromTrie);

        expect(dict.has('Straße')).toBe(true);
        expect(dict.has('Strasse')).toBe(true);
        expect(dict.has('Bundesstaat')).toBe(true);
        expect(dict.has('Goerresstraße')).toBe(true);
        expect(dict.has('Hoehenschnittpunkt')).toBe(true);
    });
});

async function readTrieDictionaryFromModules(modulePath: string, name: string): Promise<SpellingDictionaryFromTrie> {
    const dictInfo = await readDictionaryDefinitions(modulePath);
    const def = dictInfo.dictionaryDefinitions.get(name);

    // console.log('Dictionary Definitions: %o', dictInfo.dictionaryDefinitions);

    assert(def, 'Dictionary de-de not found');
    assert(isDict(def), 'Dictionary de-de has no path');

    const dictUrl = new URL(def.path, dictInfo.url);
    const trieData = await readFile(dictUrl);

    const options: SpellingDictionaryOptions = {
        ...def,
    };

    const dict = createSpellingDictionaryFromTrieFile(trieData, name, dictInfo.url.href, options);
    return dict as SpellingDictionaryFromTrie;
}

function N(s: string, mode: 'NFD' | 'NFC' = 'NFD') {
    return s.normalize(mode);
}

function isDict(dict: DictionaryDefinition): dict is DictionaryDefinitionAugmented {
    return !!dict.path;
}
