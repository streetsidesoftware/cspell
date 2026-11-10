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

// cspell:ignore Bundesstaat Goerresstraße Hoehenschnittpunkt Strasse Straße strassen

describe('SpellingDictionaryFromTrie', () => {
    test.each`
        word       | expected
        ${'hello'} | ${['hello']}
        ${'éa'}    | ${['éa', N('éa')]}
        ${N('éa')} | ${[N('éa'), 'éa']}
    `('outerWordForms $word', ({ word, expected }) => {
        expect([...outerWordForms(word)]).toEqual(expected);
    });

    test.each`
        word          | expected
        ${'straße'}   | ${true}
        ${'strasse'}  | ${true}
        ${'Strasse'}  | ${true}
        ${'STRASSE'}  | ${true}
        ${'strassen'} | ${false}
    `('has with repMap $word', ({ word, expected }) => {
        const trie = buildITrieFromWords(['straße']);
        const dict = new SpellingDictionaryFromTrie(trie, 'test', { repMap: [['ss', 'ß']] });
        expect(dict.has(word, { ignoreCase: false })).toBe(expected);
    });

    test.each`
        word       | expected
        ${'Quick'} | ${true}
        ${'quick'} | ${false}
    `('a replacement only applies in the case it lists: $word', ({ word, expected }) => {
        const trie = buildITrieFromWords(['Kick']);
        const dict = new SpellingDictionaryFromTrie(trie, 'test', { repMap: [['Qu', 'K']] });
        expect(dict.has(word, { ignoreCase: false })).toBe(expected);
    });

    test('mapWord and remapWord are undefined without a repMap', () => {
        const dict = new SpellingDictionaryFromTrie(buildITrieFromWords(['word']), 'test', {});
        expect(dict.mapWord).toBe(undefined);
        expect(dict.remapWord).toBe(undefined);
    });

    test('has with German Dictionary to make sure remap works as expected', async () => {
        const dict = await readTrieDictionaryFromModules('@cspell/dict-de-de', 'de-de');
        expect(dict).toBeInstanceOf(SpellingDictionaryFromTrie);

        expect(dict.has('Straße')).toBe(true);
        expect(dict.has('Strasse')).toBe(true);
        expect(dict.has('Bundesstaat')).toBe(true);
        expect(dict.has('Goerresstraße')).toBe(true);
        expect(dict.has('Hoehenschnittpunkt')).toBe(true);
        expect(dict.has('s'.repeat(38))).toBe(false);
    });
});

async function readTrieDictionaryFromModules(modulePath: string, name: string): Promise<SpellingDictionaryFromTrie> {
    const dictInfo = await readDictionaryDefinitions(modulePath);
    const def = dictInfo.dictionaryDefinitions.get(name);

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
