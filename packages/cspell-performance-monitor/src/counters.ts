import { getGlobalCSpellSettings } from './global.ts';
import type { Counter } from './types.ts';

class CounterImpl implements Counter {
    readonly name: string;
    count: number;

    constructor(name: string, count = 0) {
        this.name = name;
        this.count = count;
    }

    inc(): number {
        return ++this.count;
    }

    dec(): number {
        return --this.count;
    }
}

/**
 * Get or create a counter by name.
 * @param name - The name of the counter.
 * @returns The counter associated with the given name.
 */
export function counter(name: string): Counter {
    const g = getGlobalCSpellSettings();
    const counters = (g.counters ??= new Map<string, Counter>());
    const c = counters.get(name);
    if (c) return c;
    const n = new CounterImpl(name);
    counters.set(name, n);
    return n;
}

/**
 * Get all the counters currently stored.
 * @returns An iterable of all the counters currently stored.
 */
export function getCounters(): Iterable<Counter> {
    const g = getGlobalCSpellSettings();
    if (g.counters) {
        return g.counters.values();
    }
    return [];
}
