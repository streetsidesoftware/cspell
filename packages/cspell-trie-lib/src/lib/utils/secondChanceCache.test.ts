import { SecondChanceCache } from './secondChanceCache';

describe('Validate SecondChanceCache', () => {
    test('SecondChanceCache', () => {
        const cache = new SecondChanceCache<string, number>(3);
        let cnt = 0;
        cache.set('a', ++cnt);
        expect(cache.has('a')).toBe(true);
        cache.set('b', ++cnt);
        expect(cache.size).toBe(2);
        cache.set('a', 1);
        expect(cache.size).toBe(2);
        cache.set('c', ++cnt);
        expect(cache.size).toBe(3);
        expect(cache.get('c')).toBe(3);
        expect(cache.size).toBe(3);
        cache.set('d', ++cnt);
        expect(cache.size).toBe(4);
        cache.set('e', ++cnt);
        expect(cache.size).toBe(5);
        cache.set('f', ++cnt);
        expect(cache.size).toBe(6);
        expect(cache.get('b')).toBe(2);
        expect(cache.size).toBe(4);
        expect(cache.size0).toBe(1);
        expect(cache.size1).toBe(3);
        expect(cache.toArray()).toEqual([
            ['d', 4],
            ['e', 5],
            ['f', 6],
            ['b', 2],
        ]);
        cache.set('g', ++cnt);
        expect(cache.size).toBe(5);
        expect(cache.size0).toBe(2);
        expect(cache.has('a')).toBe(false);
        expect(cache.get('a')).toBe(undefined);
        expect(cache.has('f')).toBe(true);
        expect(cache.size0).toBe(3);
        expect(cache.size1).toBe(2);
        expect(cache.get('f')).toBe(6);
        expect(cache.size0).toBe(3);
        expect(cache.size1).toBe(2);
        expect(cache.clear()).toBe(cache);
        expect(cache.size).toBe(0);
    });
});
