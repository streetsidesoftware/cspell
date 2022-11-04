/* eslint-disable @typescript-eslint/ban-types */
import { StrongWeakMap } from './StrongWeakMap';
import { promisify } from 'util';

const wait = promisify(setTimeout);

describe('StrongWeakMap', () => {
    test.each`
        init                                     | add                                      | remove       | expected
        ${undefined}                             | ${undefined}                             | ${undefined} | ${[]}
        ${undefined}                             | ${[['a', 'a'], ['b', 'b'], ['a', 'aa']]} | ${undefined} | ${[['a', 'aa'], ['b', 'b']]}
        ${undefined}                             | ${[['a', 'a'], ['b', 'b'], ['a', 'aa']]} | ${['b']}     | ${[['a', 'aa']]}
        ${[['a', 'a'], ['b', 'b'], ['a', 'aa']]} | ${undefined}                             | ${['b']}     | ${[['a', 'aa']]}
    `('constructor set/delete', ({ init, add, remove, expected }) => {
        const map = new StrongWeakMap(safeBoxKeyValues(init));
        addAll(map, add);
        deleteAll(map, remove);
        const boxedExpected = boxKeyValues(expected);
        expect([...map]).toEqual(boxedExpected);
        expect(map.size).toBe(expected.length);
        expect([...map.entries()]).toEqual(boxedExpected);
        expect([...map.keys()]).toEqual(boxedExpected.map(([k]) => k));
        expect([...map.values()]).toEqual(boxedExpected.map(([_, v]) => v));
    });

    test.each`
        init                                     | add                                      | remove       | expected
        ${undefined}                             | ${undefined}                             | ${undefined} | ${[]}
        ${undefined}                             | ${[['a', 'a'], ['b', 'b'], ['a', 'aa']]} | ${undefined} | ${[]}
        ${undefined}                             | ${[['a', 'a'], ['b', 'b'], ['a', 'aa']]} | ${['b']}     | ${[]}
        ${[['a', 'a'], ['b', 'b'], ['a', 'aa']]} | ${undefined}                             | ${['b']}     | ${[]}
    `('clear', ({ init, add, remove, expected }) => {
        const map = new StrongWeakMap(safeBoxKeyValues(init));
        addAll(map, add);
        deleteAll(map, remove);
        map.clear();
        expect([...map]).toEqual(boxKeyValues(expected));
        expect(map.size).toBe(expected.length);
    });

    test.each`
        init                                     | has     | expected
        ${[['a', 'a'], ['b', 'b'], ['a', 'aa']]} | ${'a'}  | ${true}
        ${[['a', 'a'], ['b', 'b'], ['a', 'aa']]} | ${'aa'} | ${false}
    `('has', ({ init, has, expected }) => {
        const map = new StrongWeakMap(safeBoxKeyValues(init));
        expect(map.has(has)).toBe(expected);
    });

    test.each`
        init                                    | hold   | expected
        ${[['a', 'a'], ['b', 'b'], ['c', 'c']]} | ${'a'} | ${['a']}
        ${[['a', 'a'], ['b', 'b'], ['c', 'c']]} | ${'b'} | ${['b']}
    `('Garbage Collection', async ({ init, hold, expected }) => {
        const map = new StrongWeakMap(safeBoxKeyValues(init));
        const allKeys = keys(map);
        const v = map.get(hold);
        expect(v).toBeDefined();
        expect([...map.keys()]).toEqual(allKeys);
        expect(gc).toBeDefined();
        await wait(1);
        gc?.();
        await wait(1);
        expect([...map.keys()]).toEqual(allKeys);
        map.cleanKeys();
        // getting values will clean up keys
        expect([...map.keys()]).toEqual(expected);
        expect(map.get(hold)).toBe(v);
    });

    test('toStringTag', () => {
        const map = new StrongWeakMap<string, Boxed<string>>();
        expect(map[Symbol.toStringTag]).toBe('StrongWeakMap');
    });

    test('forEach', () => {
        const entries = boxKeyValues([
            ['a', 'a'],
            ['b', 'b'],
        ]);
        const map = new StrongWeakMap(entries);

        const thisArg = {};
        const _entries: typeof entries = [];

        function cb(this: typeof thisArg, v: Boxed<string>, k: string, m: Map<string, Boxed<string>>) {
            _entries.push([k, v]);
            expect(m).toBe(map);
            expect(this).toBe(thisArg);
        }

        map.forEach(cb, thisArg);
        expect(_entries).toEqual(entries);
    });
});

type Boxed<T> = T extends object ? T : { value: T };

function box<T>(value: T): Boxed<T> {
    if (value && typeof value === 'object') {
        return value as Boxed<T>;
    }
    return { value } as Boxed<T>;
}

function boxKeyValue<K, V>([k, v]: [K, V]): [K, Boxed<V>] {
    return [k, box(v)];
}

function boxKeyValues<K, V>(entries: [K, V][]) {
    return entries.map(boxKeyValue);
}

function safeBoxKeyValues<K, V>(entries: [K, V][] | undefined) {
    return entries && boxKeyValues(entries);
}

function addAll<K, V>(map: Map<K, Boxed<V>>, entries: [key: K, value: V][] | undefined) {
    entries?.map(boxKeyValue).forEach(([k, v]) => map.set(k, v));
}

function deleteAll<K, V>(map: Map<K, Boxed<V>>, keys: K[] | undefined) {
    keys?.forEach((k) => map.delete(k));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function keys<T>(iterable: Iterable<[T, ...any[]]>): T[] {
    return [...iterable].map(([k]) => k);
}
