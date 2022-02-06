import { AutoCacheMap, AutoCacheWeakMap } from './autoCacheMap';
import { isDefined } from './util';

describe('autoCacheMap', () => {
    test('AutoCacheMap', () => {
        const values = ['one', 'two', 'three', 'four', 'one', 'four', 'three', 'one', 'two', 'five'];
        const unique = [...new Set(values)];
        function transform(s: string): number {
            return s.length;
        }

        const fn = jest.fn(transform);

        const cache = new AutoCacheMap(fn);

        const r = values.map((s) => cache.get(s));
        expect(r).toEqual(values.map(transform));
        expect(fn.mock.calls).toEqual(unique.map((c) => [c]));
    });

    test('AutoCacheWeakMap', () => {
        const numbers = ['one', 'two', 'three', 'four', 'one', 'four', 'three', 'one', 'two', 'five'];
        const objs = new Map(numbers.map((s) => [s, { name: s }]));
        const values = numbers.map((n) => objs.get(n)).filter(isDefined);

        function transform(n: { name: string }): number {
            return n.name.length;
        }

        const fn = jest.fn(transform);

        const cache = new AutoCacheWeakMap(fn);

        const r = values.map((s) => cache.get(s));
        expect(r).toEqual(values.map(transform));
        expect(fn.mock.calls).toEqual([...objs.values()].map((c) => [c]));
    });
});
