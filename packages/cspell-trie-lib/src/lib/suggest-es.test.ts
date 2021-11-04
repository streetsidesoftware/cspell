import { readTrie } from './dictionaries.test.helper';
import { parseLinesToDictionary } from './SimpleDictionaryParser';

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
        ${'carmjen'}   | ${false}   | ${['carmen', 'carmene', 'carmena', 'carmená', 'carmené', 'carmeno', 'carmenó', 'carmenen']}
        ${'carmjen'}   | ${true}    | ${['carmen', 'carmene', 'carmena', 'carmená', 'carmené', 'carmeno', 'carmenó', 'carmenen']}
        ${'carmen'}    | ${true}    | ${['carmen', 'carmene', 'carmena', 'carmená', 'carmené', 'carmeno', 'carmenó']}
        ${'carmen'}    | ${false}   | ${['carmen', 'carmene', 'carmena', 'carmená', 'carmené', 'carmeno', 'carmenó']}
        ${'cafe'}      | ${false}   | ${['café', 'cafés', 'cafre', 'cabe', 'cace', 'cale', 'cañe', 'cape', 'case', 'cate', 'cave']}
        ${'niño'}      | ${false}   | ${['niño', 'niños', 'niña', 'niñeo']}
        ${'nino'}      | ${false}   | ${['niño', 'ninfo', 'niños', 'nido', 'niña', 'nito', 'niñeo']}
        ${'barcelona'} | ${false}   | ${['Barcelona', 'Bárcena', 'parcelan', 'abretona']}
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
});

function c(word: string, cost: number) {
    return { word, cost };
}

const sampleWords = ['niño', 'niños', 'niña', 'niñeo', 'dino', 'nido'];

function trieSimple() {
    return parseLinesToDictionary(sampleWords);
}
