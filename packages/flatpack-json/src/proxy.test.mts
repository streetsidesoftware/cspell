import { describe, expect, test, vi } from 'vitest';

import { deepEqual, proxyDate, proxyMap, proxyObject, proxySet } from './proxy.mjs';

describe('proxy', () => {
    test.each`
        value
        ${{ a: 'apple', b: 2 }}
        ${new WithSecret('password')}
        ${[1, 2, 3]}
    `('proxyObject $value', ({ value }) => {
        const p = proxyObject(value);
        expect(p).toEqual(value);
    });

    test.each`
        value
        ${/regexp/}
        ${new Date()}
        ${new Map()}
        ${new Set()}
    `('not supported proxyObject $value', ({ value }) => {
        const p = proxyObject(value);
        expect(p).not.toEqual(value);
        // The proxy object should have the same properties as the original object.
        expect(deepEqual(p, value)).toBe(true);
    });

    test('proxyObject', () => {
        const obj = {
            a: 'apple',
            b: 2,
        };
        const callback = vi.fn();
        const p = proxyObject(obj, callback);
        // expect(p).toEqual(obj);
        expect(p.a).toBe('apple');
        expect(p.a).toBe(obj.a);

        p.a = 'banana';
        expect(callback).toHaveBeenCalledTimes(1);
        expect(p.a).toEqual(obj.a);
        expect(p.b).toEqual(obj.b);
        expect(p).toEqual(obj);
    });

    test('proxyObject object with methods', () => {
        const obj = {
            a: 'apple',
            b: 2,
            v() {
                return this.a;
            },
        };
        const callback = vi.fn();
        const p = proxyObject(obj, callback);
        // expect(p).toEqual(obj);
        expect(p.v()).toBe('apple');
        expect(p.v()).toBe(obj.v());

        p.a = 'banana';
        expect(callback).toHaveBeenCalledTimes(1);
        expect(p.a).toEqual(obj.a);
        expect(p.b).toEqual(obj.b);
        // fails on v() because the function is bound to the original object.
        expect(p).not.toEqual(obj);
        expect(p.v).not.toEqual(obj.v);
    });

    test('proxyObject class', () => {
        class MyClass {
            a = 'apple';
            b = 2;
            v() {
                return this.a;
            }
        }
        const obj = new MyClass();
        const callback = vi.fn();
        const p = proxyObject(obj, callback);
        // expect(p).toEqual(obj);
        expect(p.v()).toBe('apple');
        expect(p.v()).toBe(obj.v());

        p.a = 'banana';
        expect(callback).toHaveBeenCalledTimes(1);
        expect(p.a).toEqual(obj.a);
        expect(p.b).toEqual(obj.b);
        expect(p).toEqual(obj);
    });

    test('proxyObject Array', () => {
        const obj = ['apple', 2, 'banana', 4, undefined];
        const callback = vi.fn();
        const p = proxyObject(obj, callback);
        // expect(p).toEqual(obj);
        expect(p[0]).toBe('apple');
        expect(p['0']).toBe(obj[0]);

        p[6] = 'banana';
        expect(callback).toHaveBeenCalledTimes(1);
        expect(p).toEqual(obj);
        expect(p.length).toBe(obj.length);
        p.length = 10;
        expect(callback).toHaveBeenCalledTimes(2);
        expect(obj.length).toBe(10);
        expect(p).toEqual(obj);
    });

    test('date', () => {
        const d = new Date();
        const callback = vi.fn();
        const p = proxyDate(d, callback);
        expect(p).toBeInstanceOf(Date);
        expect(p).toEqual(d);

        expect(callback).toHaveBeenCalledTimes(0);

        p.setTime(Date.now() + 1000);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(p).toEqual(d);

        // Updating the original object won't trigger a callback.
        d.setTime(Date.now() + 2000);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(p).toEqual(d);

        p.setFullYear(2020);
        expect(callback).toHaveBeenCalledTimes(2);
        expect(p).toEqual(d);
    });

    test('proxyMap', () => {
        const callback = vi.fn();
        const src = new Map(Object.entries({ a: 'apple', b: 2 }));
        const map = proxyMap(src, callback);
        expect(map).toBeInstanceOf(Map);
        expect(map.get('a')).toBe('apple');
        expect(map.get('b')).toBe(2);
        // inherited Maps are not equal to the original Map, the method do not match.
        expect(map).not.toEqual(src);
        expect(new Map(map)).toEqual(src);
        map.set('a', 'banana');
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenLastCalledWith(map, 'a', 'banana');
        expect(map.get('a')).toBe('banana');

        map.delete('a');
        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenLastCalledWith(map, 'a', undefined);
        expect(map.get('a')).toBe(undefined);

        map.clear();
        expect(callback).toHaveBeenCalledTimes(3);
        expect(callback).toHaveBeenLastCalledWith(map, undefined, undefined);
    });

    test('proxySet', () => {
        const callback = vi.fn();
        const src = new Set(Object.keys({ a: 'apple', b: 2 }));
        const s = proxySet(src, callback);
        expect(s).toBeInstanceOf(Set);
        expect(s.has('a')).toBe(true);
        expect(s.has('b')).toBe(true);
        expect(s.add('a')).toBe(s);
        expect(s.size).toBe(2);
        expect(s).not.toEqual(src);
        expect(new Set(s)).toEqual(src);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenLastCalledWith(s, 'a');

        s.delete('a');
        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenLastCalledWith(s, 'a');
        expect(s.has('a')).toBe(false);
        expect(s.size).toBe(1);

        s.clear();
        expect(callback).toHaveBeenCalledTimes(3);
        expect(callback).toHaveBeenLastCalledWith(s, undefined);
    });
});

class WithSecret {
    #secret: string;

    constructor(secret: string) {
        this.#secret = secret;
    }

    getSecret() {
        return this.#secret;
    }

    get value() {
        return this.#secret;
    }
}
