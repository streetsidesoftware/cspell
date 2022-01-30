import { AutoCache, AutoWeakCache, SimpleCache, SimpleWeakCache } from './simpleCache';

describe('AutoCache', () => {
    test.each`
        items                                | size | expected
        ${[]}                                | ${2} | ${[]}
        ${[1, 2, 3, 4, 5, 6]}                | ${2} | ${[1, 2, 3, 4, 5, 6]}
        ${[1, 2, 3, 4, 5, 6]}                | ${1} | ${[1, 2, 3, 4, 5, 6]}
        ${[1, 2, 3, 4, 5, 6]}                | ${0} | ${[1, 2, 3, 4, 5, 6]}
        ${[1, 1, 1, 1, 1, 1]}                | ${0} | ${[1]}
        ${[1, 1, 1, 1, 1, 1]}                | ${1} | ${[1]}
        ${[1, 2, 1, 2, 1, 2]}                | ${1} | ${[1, 2]}
        ${[1, 2, 1, 2, 3, 1, 2, 1, 2]}       | ${1} | ${[1, 2, 3]}
        ${[1, 2, 1, 2, 3, 1, 3, 2, 1, 2]}    | ${1} | ${[1, 2, 3, 2]}
        ${[1, 2, 1, 2, 3, 1, 3, 2, 1, 2, 3]} | ${1} | ${[1, 2, 3, 2, 3]}
    `('AutoCache $items $size', ({ items, size, expected }) => {
        const mock = jest.fn((a) => a);
        const cache = new AutoCache(mock, size);
        for (const v of items) {
            const r = cache.get(v);
            expect(r).toBe(v);
            expect(cache.has(v)).toBe(true);
        }
        expect(mock.mock.calls.reduce((a, v) => a.concat(v), <unknown[]>[])).toEqual(expected);
    });
});

describe('SimpleCache', () => {
    test('SimpleCache', () => {
        const [a, b, c, hello, there, again] = ['a', 'b', 'c', 'hello', 'there', 'again'];

        const cache = new SimpleCache<string, string>(1);

        expect(cache.has(hello)).toBe(false);
        expect(cache.get(hello)).toBeUndefined();
        cache.set(hello, there);
        expect(cache.get(hello)).toBe(there);
        cache.set(hello, again);
        expect(cache.get(hello)).toBe(again);

        // stack: hello:again
        cache.set(a, a);
        // stack: a:a, hello:again
        expect(cache.has(hello)).toBe(true);
        cache.set(b, b);
        // stack: b:b, a:a, hello:again
        expect(cache.has(hello)).toBe(true);
        cache.set(c, c);
        // stack: c:c, b:b, a:a
        expect(cache.has(hello)).toBe(false);
        expect(cache.has(a)).toBe(true);
        // Cause a to be bumped by asking for b
        expect(cache.get(b)).toBe(b);
        // stack: b:b, c:c, b:b
        expect(cache.has(a)).toBe(false);
        cache.set(b, again);
        // stack: b:again, c:c, b:b
        expect(cache.has(c)).toBe(true);
        cache.set(hello, hello);
        // stack: hello:hello, b:again, c:c
        expect(cache.has(c)).toBe(true);
        cache.set(hello, there);
        // stack: hello:there, b:again, c:c
        expect(cache.has(c)).toBe(true);
        // stack: hello:there, b:again, c:c
        expect(cache.get(c)).toBe(c);
        // stack: c:c, hello:there, b:again
        expect(cache.get(b)).toBe(again);
        // stack: b:again, c:c, hello:there
        cache.set(b, b);
        // stack: b:b, c:c, hello:there
        expect(cache.get(b)).toBe(b);
    });
});

describe('SimpleWeakCache', () => {
    test('SimpleWeakCache', () => {
        const [a, b, c, hello, there, again] = [['a'], ['b'], ['c'], ['hello'], ['there'], ['again']];

        const cache = new SimpleWeakCache<string[], string[]>(1);

        expect(cache.has(hello)).toBe(false);
        expect(cache.get(hello)).toBeUndefined();
        cache.set(hello, there);
        expect(cache.get(hello)).toBe(there);
        cache.set(hello, again);
        expect(cache.get(hello)).toBe(again);

        // stack: hello:again
        cache.set(a, a);
        // stack: a:a, hello:again
        expect(cache.has(hello)).toBe(true);
        cache.set(b, b);
        // stack: b:b, a:a, hello:again
        expect(cache.has(hello)).toBe(true);
        cache.set(c, c);
        // stack: c:c, b:b, a:a
        expect(cache.has(hello)).toBe(false);
        expect(cache.has(a)).toBe(true);
        // Cause a to be bumped by asking for b
        expect(cache.get(b)).toBe(b);
        // stack: b:b, c:c, b:b
        expect(cache.has(a)).toBe(false);
        cache.set(b, again);
        // stack: b:again, c:c, b:b
        expect(cache.has(c)).toBe(true);
        cache.set(hello, hello);
        // stack: hello:hello, b:again, c:c
        expect(cache.has(c)).toBe(true);
        cache.set(hello, there);
        // stack: hello:there, b:again, c:c
        expect(cache.has(c)).toBe(true);
        // stack: hello:there, b:again, c:c
        expect(cache.get(c)).toBe(c);
        // stack: c:c, hello:there, b:again
        expect(cache.get(b)).toBe(again);
        // stack: b:again, c:c, hello:there
        cache.set(b, b);
        // stack: b:b, c:c, hello:there
        expect(cache.get(b)).toBe(b);
    });
});

describe('AutoWeakCache', () => {
    const sampleItems = [[0], [1], [2], [3], [4], [5], [6]];

    function s(i: number) {
        return sampleItems[i];
    }

    test.each`
        items                                                                 | size | expected
        ${[]}                                                                 | ${2} | ${[]}
        ${[s(1), s(2), s(3), s(4), s(5), s(6)]}                               | ${2} | ${[s(1), s(2), s(3), s(4), s(5), s(6)]}
        ${[s(1), s(2), s(3), s(4), s(5), s(6)]}                               | ${1} | ${[s(1), s(2), s(3), s(4), s(5), s(6)]}
        ${[s(1), s(2), s(3), s(4), s(5), s(6)]}                               | ${0} | ${[s(1), s(2), s(3), s(4), s(5), s(6)]}
        ${[s(1), s(1), s(1), s(1), s(1), s(1)]}                               | ${0} | ${[s(1)]}
        ${[s(1), s(1), s(1), s(1), s(1), s(1)]}                               | ${1} | ${[s(1)]}
        ${[s(1), s(2), s(1), s(2), s(1), s(2)]}                               | ${1} | ${[s(1), s(2)]}
        ${[s(1), s(2), s(1), s(2), s(3), s(1), s(2), s(1), s(2)]}             | ${1} | ${[s(1), s(2), s(3)]}
        ${[s(1), s(2), s(1), s(2), s(3), s(1), s(3), s(2), s(1), s(2)]}       | ${1} | ${[s(1), s(2), s(3), s(2)]}
        ${[s(1), s(2), s(1), s(2), s(3), s(1), s(3), s(2), s(1), s(2), s(3)]} | ${1} | ${[s(1), s(2), s(3), s(2), s(3)]}
    `('AutoWeakCache $items $size', ({ items, size, expected }) => {
        const mock = jest.fn((a) => a);
        const cache = new AutoWeakCache(mock, size);
        for (const v of items) {
            const r = cache.get(v);
            expect(r).toBe(v);
            expect(cache.has(v)).toBe(true);
        }
        expect(mock.mock.calls.reduce((a, v) => a.concat(v), <unknown[]>[])).toEqual(expected);
    });
});
