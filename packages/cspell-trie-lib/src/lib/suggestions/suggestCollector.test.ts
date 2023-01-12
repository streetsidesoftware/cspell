import type { WeightMap } from '../distance';
import { createWeightedMap, editDistance } from '../distance';
import { formattedDistance } from '../distance/formatResultEx';
import { mapDictionaryInformationToWeightMap } from '../mappers/mapDictionaryInfoToWeightMap';
import { clean } from '../utils/util';
import type { SuggestionCollectorOptions, SuggestionGenerator, SuggestionResult } from './suggestCollector';
import { DEFAULT_COMPOUNDED_WORD_SEPARATOR, impersonateCollector, suggestionCollector } from './suggestCollector';

const defaultOptions: SuggestionCollectorOptions = {
    numSuggestions: 10,
    ignoreCase: undefined,
    changeLimit: undefined,
    timeout: undefined,
};

describe('Validate suggestCollector', () => {
    test('Tests the collector with filter', () => {
        const collector = suggestionCollector(
            'joyfully',
            sugOpts({ numSuggestions: 3, filter: (word) => word !== 'joyfully' })
        );
        collector.add({ word: 'joyfully', cost: 100 }).add({ word: 'joyful', cost: 100 });
        expect(collector.suggestions).toHaveLength(1);
    });

    test('Tests the collector with duplicate words of different costs', () => {
        const collector = suggestionCollector(
            'joyfully',
            sugOpts({ numSuggestions: 3, filter: (word) => word !== 'joyfully' })
        );
        collector.add({ word: 'joyful', cost: 100 });
        expect(collector.suggestions.length).toBe(1);
        collector.add({ word: 'joyful', cost: 75 });
        expect(collector.suggestions.length).toBe(1);
        expect(collector.suggestions[0].cost).toBe(75);
        collector
            .add({ word: 'joyfuller', cost: 200 })
            .add({ word: 'joyfullest', cost: 300 })
            .add({ word: 'joyfulness', cost: 340 })
            .add({ word: 'joyful', cost: 85 });
        expect(collector.suggestions.length).toBe(3);
        expect(collector.suggestions[0].cost).toBe(75);
    });

    test('collect', () => {
        const spellResults = [
            { word: 'joyfuller', cost: 200 },
            { word: 'joyfullest', cost: 300 },
            { word: 'joy', cost: 500 },
            { word: 'joyfulness', cost: 340 },
            { word: 'joyfuller', cost: 200 },
            { word: 'joy full', cost: 285 },
            { word: 'joyful', cost: 85 },
        ];
        const rValues: (number | undefined | symbol)[] = [];

        function* emit(): SuggestionGenerator {
            for (const r of spellResults) {
                rValues.push(yield r);
            }
        }

        const collector = suggestionCollector(
            'joyfully',
            sugOpts({ numSuggestions: 3, filter: (word) => word !== 'joyfully' })
        );
        collector.collect(emit());
        expect(collector.suggestions.length).toBe(3);
        expect(collector.suggestions[0].cost).toBe(85);
        // 285 -> 295 because the weight was adjusted because of the space.
        expect(rValues).toEqual([412, 412, 412, 412, 412, 300, 295]);
    });

    function s(word: string, cost: number, compoundWord?: string): SuggestionResult {
        return clean({ word, cost, compoundWord: compoundWord?.replace(/[|]/g, DEFAULT_COMPOUNDED_WORD_SEPARATOR) });
    }

    // cspell:ignore joyo woudt
    test.each`
        word       | expected
        ${'word'}  | ${[s('word', 0), s('work', 100), s('words', 100)]}
        ${'words'} | ${[s('words', 0), s('word', 100), s('works', 100)]}
        ${'joy'}   | ${[s('joy', 5)]}
        ${'joyo'}  | ${[s('joy', 105), s('yo-yo', 200), s('joyous', 200)]}
        ${'woudt'} | ${[s('word', 200), s("won't", 200), s('words', 200), s('would', 200)]}
        ${'cafe'}  | ${[s('cafe', 0), s('café', 100), s('cafés', 200)]}
    `('collect suggestions for "$word"', ({ word, expected }) => {
        const collector = suggestionCollector(word, sugOpts({ numSuggestions: 3, changeLimit: 5, includeTies: true }));
        const sugs = sampleSuggestions().map((sugWord) => ({ word: sugWord, cost: editDistance(word, sugWord) }));
        sugs.forEach((sug) => collector.add(sug));
        expect(collector.suggestions).toEqual(expected);
    });

    // cspell:ignore aple
    test.each`
        word       | expected
        ${'word'}  | ${[s('word', 0), s('work', 110), s('words', 110)]}
        ${'words'} | ${[s('words', 0), s('word', 110), s('works', 110)]}
        ${'joy'}   | ${[s('joy', 0)]}
        ${'joyo'}  | ${[s('joy', 75), s('joyous', 165), s('yo-yo', 220)]}
        ${'woudt'} | ${[s('word', 220), s("won't", 220), s('words', 220), s('would', 220)]}
        ${'aple'}  | ${[s('apple', 55), s('apples', 165)]}
        ${'cafe'}  | ${[s('cafe', 0), s('café', 1), s('cafés', 111)]}
    `('collect weighted suggestions for "$word"', ({ word, expected }) => {
        const weightMap = sampleWeightMapNoDefaultWeights();
        const collector = suggestionCollector(
            word,
            sugOpts({ numSuggestions: 3, changeLimit: 5, includeTies: true, weightMap })
        );
        const sugs = sampleSuggestions().map((sugWord) => ({ word: sugWord, cost: editDistance(word, sugWord) }));
        sugs.forEach((sug) => collector.add(sug));

        const suggestions = collector.suggestions;
        expect(
            suggestions
                .map((a) => a.word)
                .map((wordB) => formattedDistance(word.normalize('NFD'), wordB.normalize('NFD'), weightMap, 110))
        ).toMatchSnapshot();

        expect(suggestions).toEqual(expected);
    });

    test.each`
        word         | expected
        ${'word'}    | ${[s('word', 0), s('work', 100), s('words', 100)]}
        ${'words'}   | ${[s('words', 0), s('word', 100), s('works', 100)]}
        ${'joy'}     | ${[s('joy', 0)]}
        ${'joyo'}    | ${[s('joy', 75), s('joyous', 155), s('yo-yo', 305)]}
        ${'woudt'}   | ${[s('word', 200), s('words', 200), s('would', 200)]}
        ${'aple'}    | ${[s('apple', 55), s('apples', 155)]}
        ${'cafe'}    | ${[s('cafe', 0), s('café', 1), s('cafés', 101)]}
        ${'tim'}     | ${[s('time', 75)]}
        ${'runtime'} | ${[s('runtime', 100, 'run|time'), s('time', 200 + 75 + 4)]}
    `('collect weighted suggestions for "$word"', ({ word, expected }) => {
        const collector = suggestionCollector(
            word,
            sugOpts({ numSuggestions: 3, changeLimit: 5, includeTies: true, weightMap: sampleWeightMapDi() })
        );
        const sugs = sampleSuggestions().map((sugWord) => ({ word: sugWord, cost: editDistance(word, sugWord) }));
        sugs.forEach((sug) => collector.add(sug));
        expect(collector.suggestions).toEqual(expected);
    });

    test('impersonateCollector', () => {
        const collector = suggestionCollector('hello', { numSuggestions: 1, changeLimit: 3, ignoreCase: true });
        const ic = impersonateCollector(collector, 'Hello');
        expect(ic.collect).toBe(collector.collect);
        expect(ic.word).toBe('Hello');
        const suggestion = { word: 'hello', cost: 1 };
        ic.add(suggestion);
        expect(ic.suggestions).toEqual([suggestion]);
        expect(ic.maxCost).toBeGreaterThan(200);
        expect(ic.maxNumSuggestions).toBe(1);
        expect(ic.word).toBe('Hello');
        expect(collector.word).toBe('hello');
        expect(collector.suggestions).toEqual([suggestion]);
    });
});

function sugOpts(opts: Partial<SuggestionCollectorOptions>): SuggestionCollectorOptions {
    return {
        ...defaultOptions,
        ...opts,
    };
}

function sampleSuggestions(): string[] {
    return ['']
        .concat(['joy', 'joyful', 'joyfully', 'joyous', 'enjoy', 'enjoyment', 'joyfulness', 'joyless', 'enjoys'])
        .concat(['one', 'two', 'concat', 'string', 'function', 'return', 'partial', 'values', 'value', 'collector'])
        .concat(['color', 'word', 'words', 'would', "wouldn't", "won't", 'water', 'walk', 'walking', 'cost'])
        .concat(['calculate', 'suggest', 'suggestion', 'supplement', 'apple', 'apples', 'walked', 'walker'])
        .concat(['yo-yo', 'the', 'saw', 'raw', 'paw', 'this', 'these', 'those', 'work', 'works', 'working'])
        .concat(['workable', 'worked', 'cafe', 'café', 'resume', 'résumé', 'cafés'])
        .concat(['run|time', 'coffee|shop', 'run', 'time', 'coffee', 'shop', 'street|wise'])
        .concat([])
        .map((a) => a.replace(/[|]/g, DEFAULT_COMPOUNDED_WORD_SEPARATOR));
}

function dictInfo() {
    return {
        locale: 'es-US',
        alphabet: 'a-zA-Z',
        suggestionEditCosts: [
            {
                map: 'aeiouy', // cspell:disable-line
                insDel: 75,
                replace: 50,
            },
            {
                map: "p(pp)|l(ll)|t(tt)|o(ou)(oh)|n(ing)('n)",
                replace: 55,
            },
            {
                // cspell:disable-next-line
                map: 'aàâäAÀÂÄ|eéèêëEÉÈÊË|iîïyIÎÏY|oôöOÔÖ|uùûüUÙÛÜ|cçCÇ|bB|dD|fF|gG|hH|jJ|kK|lL|mM|nN|pP|qQ|rR|sS|tT|vV|wW|xX|zZ',
                replace: 1,
            },
        ],
    };
}

function sampleWeightMapDi(): WeightMap {
    return mapDictionaryInformationToWeightMap(dictInfo());
}

function sampleWeightMapNoDefaultWeights(): WeightMap {
    return createWeightedMap(dictInfo().suggestionEditCosts);
}
