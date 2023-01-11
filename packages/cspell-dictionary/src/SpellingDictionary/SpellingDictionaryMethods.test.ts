import { hasOptionToSearchOption, impersonateCollector, suggestionCollector } from './SpellingDictionaryMethods';

describe('SpellingDictionaryMethods', () => {
    test('impersonateCollector', () => {
        const collector = suggestionCollector('hello', { numSuggestions: 1, changeLimit: 3, ignoreCase: true });
        const ic = impersonateCollector(collector, 'Hello');
        const suggestion = { word: 'hello', cost: 1 };
        ic.add(suggestion);
        expect(ic.suggestions).toEqual([suggestion]);
        expect(ic.maxCost).toBeGreaterThan(200);
        expect(ic.maxNumSuggestions).toBe(1);
        expect(ic.word).toBe('Hello');
        expect(collector.word).toBe('hello');
    });

    test.each`
        prime                                        | copy                                              | expected
        ${undefined}                                 | ${undefined}                                      | ${{}}
        ${undefined}                                 | ${{}}                                             | ${{}}
        ${undefined}                                 | ${{ ignoreCase: undefined }}                      | ${{}}
        ${{ ignoreCase: true }}                      | ${{ ignoreCase: true }}                           | ${{ ignoreCase: true, useCompounds: undefined }}
        ${{ ignoreCase: true }}                      | ${{ ignoreCase: true, useCompounds: undefined }}  | ${{ ignoreCase: true, useCompounds: undefined }}
        ${{ ignoreCase: false }}                     | ${{ ignoreCase: false, useCompounds: undefined }} | ${{ ignoreCase: false, useCompounds: undefined }}
        ${{ ignoreCase: false, useCompounds: 3 }}    | ${{ ignoreCase: false, useCompounds: 3 }}         | ${{ ignoreCase: false, useCompounds: 3 }}
        ${{ ignoreCase: false, useCompounds: true }} | ${{ ignoreCase: false, useCompounds: true }}      | ${{ ignoreCase: false, useCompounds: true }}
    `('hasOptionToSearchOption $prime / $copy', ({ prime, copy, expected }) => {
        const a = hasOptionToSearchOption(prime);
        expect(a).toEqual(expected);
        const a1 = hasOptionToSearchOption(copy);
        expect(a1).toBe(a);
    });
});
