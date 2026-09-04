import { describe, expect, test } from 'vitest';

import { counter, getCounters } from './counters.ts';

describe('counters', () => {
    test('should create and retrieve a counter', () => {
        const c = counter('test');
        expect(c.count).toBe(0);
        c.inc();
        expect(c.count).toBe(1);
        c.dec();
        expect(c.count).toBe(0);
        const c2 = counter('test');
        expect(c2).toBe(c);
    });

    test('should maintain separate counters for different names', () => {
        const c1 = counter('counter1');
        const c2 = counter('counter2');
        expect(c1).not.toBe(c2);
        expect(c1.count).toBe(0);
        expect(c2.count).toBe(0);
        c1.inc();
        expect(c1.count).toBe(1);
        expect(c2.count).toBe(0);
    });

    test('should return all counters', () => {
        const c1 = counter('all1');
        const c2 = counter('all2');
        const allCounters = [...getCounters()];
        expect(allCounters).toContain(c1);
        expect(allCounters).toContain(c2);
    });
});
