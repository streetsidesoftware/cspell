import { describe, expect, test } from 'vitest';

import { FreqCounter } from './FreqCounter';

describe('Validate FreqCounter', () => {
    test('Creating an empty Counter', () => {
        const counter = FreqCounter.create();
        expect(counter).toBeInstanceOf(FreqCounter);
        expect(counter.total).toBe(0);
        expect(counter.getFreq(1)).toBe(0);
        expect(counter.counters).toBeInstanceOf(Map);
    });
    test('Adding values to a counter', () => {
        const counter = FreqCounter.create([1, 1, 2, 3]);
        expect(counter.total).toBe(4);
        expect(counter.getCount(1)).toBe(2);
        expect(counter.getCount(2)).toBe(1);
        expect(counter.getFreq(1)).toBe(0.5);
    });
    test('merging counters', () => {
        const counter = FreqCounter.create([1, 1, 2, 3]);
        const counter2 = FreqCounter.create([1, 2, 2, 3, 3]);
        expect(counter.total).toBe(4);
        expect(counter2.total).toBe(5);
        counter.merge(counter2, counter2);
        expect(counter.total).toBe(14);
        expect(counter.getCount(1)).toBe(4);
    });
});
