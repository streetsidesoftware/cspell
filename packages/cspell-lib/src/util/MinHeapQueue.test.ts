import { describe, expect, test } from 'vitest';

import { compare } from './Comparable';
import { __testing__, MinHeapQueue } from './MinHeapQueue';

const { addToHeap, takeFromHeap } = __testing__;

describe('Validate Mere Sort methods', () => {
    test.each`
        letters
        ${'letters'}
        ${'fun with the alphabet'}
        ${'aaaaaaaaaaaaaaaaaa'}
    `('Merge $letters', ({ letters }: { letters: string }) => {
        const s: string[] = [];
        letters.split('').forEach((a) => {
            addToHeap(s, a, compare);
        });
        const sorted = takeAll(s);
        expect(sorted).toEqual(letters.split('').sort());
    });

    test.each`
        letters
        ${'letters'}
        ${'fun with the alphabet'}
        ${'abc def ghi jkl mno pqr stu vwx yz'}
        ${'aaaaaaaaaaaaaaaaaa'}
    `('Merge Queue $letters', ({ letters }: { letters: string }) => {
        const q = new MinHeapQueue<string>(compare);
        const values = letters.split('');
        q.concat(values);
        expect(q.length).toBe(values.length);
        const sorted = [...q];
        expect(sorted).toEqual(letters.split('').sort());
        expect(q.length).toBe(0);
    });

    test('Queue', () => {
        const q = new MinHeapQueue<string>(compare);
        expect(q.length).toBe(0);
        q.add('one');
        q.add('two');
        expect(q.length).toBe(2);
        expect(q.dequeue()).toBe('one');
        q.add('three');
        q.add('four');
        q.add('five');
        expect(q.dequeue()).toBe('five');
        expect([...q]).toEqual(['four', 'three', 'two']);
    });

    test('Queue numbers', () => {
        // prettier-ignore
        const values = [
            831,  923,  621, 1422,  668,  489,
            695, 1127,  173,  131,  219,  685,
            132,  447,  719,  812, 1348, 1005,
            665, 1040,  216, 1081,  150, 1189,
            286,  302, 1398,  797,  694,  165,
           1350,  577,  295, 1293,  962,  703
         ];

        const sorted = values.concat().sort(compare);
        const q = new MinHeapQueue<number>(compare);
        q.concat(values);
        expect([...q]).toEqual(sorted);
    });

    test('Queue Random', () => {
        const q = new MinHeapQueue<number>(compare);
        for (let i = 0; i < 100; ++i) {
            const s = Math.random();
            const n = Math.floor(100 * s);
            const expected: number[] = [];
            for (let j = 0; j < n; ++j) {
                const r = Math.floor(Math.random() * 997);
                expected.push(r);
                q.add(r);
            }
            expected.sort(compare);
            expect([...q]).toEqual(expected);
            expect(q.length).toBe(0);
        }
    });

    test('Clone', () => {
        const q = new MinHeapQueue<number>(compare);
        for (let i = 0; i < 10; ++i) {
            const s = Math.random();
            const n = Math.floor(100 * s);
            const expected: number[] = [];
            for (let j = 0; j < n; ++j) {
                const r = Math.floor(Math.random() * 997);
                expected.push(r);
                q.add(r);
            }
            expected.sort(compare);
            const c = q.clone();
            expect([...q]).toEqual(expected);
            expect(c.length).toEqual(expected.length);
            expect([...c]).toEqual(expected);
        }
    });
});

function takeAll<T extends string | number>(t: T[]): T[] {
    const c = t.concat([]);
    const r: T[] = [];
    while (c.length) {
        const x = takeFromHeap(c, compare);
        if (x !== undefined) {
            r.push(x);
        }
    }

    return r;
}
