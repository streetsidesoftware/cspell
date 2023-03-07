import { describe, expect, test } from 'vitest';

import { SuggestionCollector } from './SuggestionCollector';

describe('SuggestionCollector', () => {
    test('Quick tests, no real logic', () => {
        const s = new SuggestionCollector(5, 50);
        expect(s.size).toBe(5);
        expect(s.minScore).toBe(50);
        const a = s.collection;
        const b = s.collection;
        expect(a).toEqual([]);
        expect(b).not.toBe(a);
        const c = s.sortedCollection;
        expect(c).toEqual([]);
    });
});
