import { impersonateCollector, suggestionCollector } from './SpellingDictionaryMethods';

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
});
