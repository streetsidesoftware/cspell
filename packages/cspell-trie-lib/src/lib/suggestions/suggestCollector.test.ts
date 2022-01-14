import { suggestionCollector, SuggestionCollectorOptions, SuggestionGenerator } from './suggestCollector';

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
});

function sugOpts(opts: Partial<SuggestionCollectorOptions>): SuggestionCollectorOptions {
    return {
        ...defaultOptions,
        ...opts,
    };
}
