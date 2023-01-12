import type { DictionaryInformation } from '@cspell/cspell-types';

import { readTrie } from '../../test/dictionaries.test.helper';
import type { WeightMap } from '../distance';
import { distanceAStarWeightedEx } from '../distance/distanceAStarWeighted';
import { formatExResult } from '../distance/formatResultEx';
import { mapDictionaryInformationToWeightMap } from '../mappers/mapDictionaryInfoToWeightMap';
import { parseLinesToDictionary } from '../SimpleDictionaryParser';

function getTrie() {
    return readTrie('@cspell/dict-es-es/cspell-ext.json');
}

describe('Validate Spanish Suggestions', () => {
    // cspell:locale en,es
    // cspell:ignore Carmjen
    // cspell:disableCaseSensitive
    // cspell:ignore barcelona carmjen nino
    test.each`
        word           | ignoreCase | expectedWords
        ${'carmjen'}   | ${false}   | ${['carmen', 'carmene', 'carmena', 'carmené', 'carmeno', 'carmenó', 'carmenen']}
        ${'carmjen'}   | ${true}    | ${['carmen', 'carmene', 'carmena', 'carmené', 'carmeno', 'carmenó', 'carmenen']}
        ${'carmen'}    | ${true}    | ${['carmen', 'carmene', 'carmena', 'carmené', 'carmeno', 'carmenó']}
        ${'carmen'}    | ${false}   | ${['carmen', 'carmene', 'carmena', 'carmené', 'carmeno', 'carmenó']}
        ${'cafe'}      | ${false}   | ${['café', 'cafés', 'cafre', 'cabe', 'cace', 'cale', 'cape', 'case', 'cate', 'cave']}
        ${'niño'}      | ${false}   | ${['niño', 'niños', 'niña', 'niñeo']}
        ${'nino'}      | ${false}   | ${['niño', 'ninfo', 'niños', 'nido', 'niña', 'nito', 'niñeo']}
        ${'barcelona'} | ${false}   | ${['Barcelona', 'parcelan', 'abretona', 'barceos', 'barcarola']}
        ${'Mexico'}    | ${false}   | ${['México', 'mexica', 'medico', 'medicó', 'médico']}
    `('Tests suggestions "$word" ignoreCase: $ignoreCase', async ({ word, ignoreCase, expectedWords }) => {
        jest.setTimeout(5000);
        const trie = await getTrie();
        const suggestions = trie.suggest(word, { numSuggestions: 4, ignoreCase });
        expect(suggestions).toEqual(expectedWords);
    });

    test.each`
        word      | ignoreCase | expectedWords
        ${'niño'} | ${false}   | ${[c('niño', 0), c('niños', 95), c('niña', 96), c('niñeo', 96)]}
        ${'nino'} | ${false}   | ${[c('niño', 1), c('ninfo', 96), c('niños', 96), c('nido', 97), c('niña', 97), c('nito', 97), c('niñeo', 97)]}
    `('Tests suggestions "$word" ignoreCase: $ignoreCase', async ({ word, ignoreCase, expectedWords }) => {
        jest.setTimeout(5000);
        const trie = await getTrie();
        const results = trie.suggestWithCost(word, { numSuggestions: 4, ignoreCase });
        expect(results).toEqual(expectedWords);
    });

    test.each`
        word      | ignoreCase | expectedWords
        ${'niño'} | ${false}   | ${[c('niño', 0), c('niños', 95), c('niña', 96), c('niñeo', 96), c('nido', 97), c('dino', 100)]}
        ${'nino'} | ${false}   | ${[c('niño', 1), c('niños', 96), c('nido', 97), c('niña', 97), c('niñeo', 97), c('dino', 99)]}
    `('Tests suggestions "$word" ignoreCase: $ignoreCase', ({ word, ignoreCase, expectedWords }) => {
        const trie = trieSimple();
        const results = trie.suggestWithCost(word, { numSuggestions: 10, ignoreCase });
        expect(results).toEqual(expectedWords);
    });

    // cspell:ignore nïño
    test.each`
        word      | ignoreCase | expectedWords
        ${'niño'} | ${false}   | ${[c('niño', 0), c('niños', 50), c('niña', 75), c('niñeo', 75)]}
        ${'nïño'} | ${false}   | ${[c('niño', 1), c('niños', 51), c('niña', 76), c('niñeo', 76)]}
        ${'nino'} | ${false}   | ${[c('niño', 1), c('niños', 51), c('niña', 76), c('niñeo', 76)]}
    `('Tests suggestions weighted "$word" ignoreCase: $ignoreCase', async ({ word, ignoreCase, expectedWords }) => {
        jest.setTimeout(5000);
        const trie = await getTrie();
        const wm = weightMap();
        const results = trie.suggestWithCost(word, { numSuggestions: 4, ignoreCase, weightMap: wm });
        expect(results).toEqual(expectedWords);
    });
    test.each`
        wordA     | wordB
        ${'niño'} | ${'niños'}
        ${'nïño'} | ${'niños'}
        ${'nino'} | ${'niña'}
    `('weighted distance "$wordA" $wordB', async ({ wordA, wordB }) => {
        const nWordA = wordA.normalize('NFD');
        const nWordB = wordB.normalize('NFD');

        const wm = weightMap();

        const dex = distanceAStarWeightedEx(wordA, wordB, wm);
        expect(formatExResult(dex)).toMatchSnapshot();

        const dexN = distanceAStarWeightedEx(nWordA, nWordB, wm);
        expect(formatExResult(dexN)).toMatchSnapshot();
    });
});

function c(word: string, cost: number) {
    return { word, cost };
}

const sampleWords = ['niño', 'niños', 'niña', 'niñeo', 'dino', 'nido'];

function trieSimple() {
    return parseLinesToDictionary(sampleWords);
}

const defaultDictInfo: DictionaryInformation = {
    locale: 'es-ES',
    // cspell:disable-next-line
    alphabet: 'aeroinsctldumpbgfvhzóíjáqéñxyúükwAEROINSCTLDUMPBGFVHZÓÍJÁQÉÑXYÚÜKW',
    suggestionEditCosts: [
        {
            map: '(o$)(os$)(a$)(eo$)',
            replace: 75,
        },
        {
            map: '(o$)(os$)|(a$)(as$)',
            replace: 50,
        },
    ],
};

function weightMap(di: DictionaryInformation = defaultDictInfo): WeightMap {
    return mapDictionaryInformationToWeightMap(di);
}
