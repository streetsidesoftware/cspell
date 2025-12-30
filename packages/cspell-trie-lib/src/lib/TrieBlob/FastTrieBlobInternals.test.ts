import { describe, expect, test } from 'vitest';

import { assertSorted, sortNodes } from './FastTrieBlobInternals.ts';

describe('FastTrieBlobInternals', () => {
    test('assertSorted passes for sorted nodes', () => {
        const nodes: (Uint32Array | number[])[] = [
            new Uint32Array([0, 0xff01, 2, 3]),
            new Uint32Array([0, 10, 20, 30]),
            [0, 5, 15, 25],
        ];
        expect(() => assertSorted(nodes, 0xff)).not.toThrow();
    });

    test('assertSorted throws for unsorted nodes', () => {
        const nodes: (Uint32Array | number[])[] = [
            new Uint32Array([0, 3, 2, 1]),
            new Uint32Array([0, 10, 5, 20]),
            [0, 25, 15, 5],
        ];
        expect(() => assertSorted(nodes, 0xff)).toThrow(/Node 0 is not sorted/);
    });

    test('sortNodes sorts unsorted nodes', () => {
        const nodes: (Uint32Array | number[])[] = [
            new Uint32Array([3, 3, 2, 1]),
            new Uint32Array([4, 10, 5, 20, 99]),
            Uint32Array.from([3, 5, 15, 25]),
            [1, 1],
            [3, 1, 3, 2],
            [4, 10, 5, 20, 99],
        ];
        const sortedNodes = [
            Uint32Array.from([3, 1, 2, 3]),
            Uint32Array.from([4, 5, 10, 20, 99]),
            Uint32Array.from([3, 5, 15, 25]),
            [1, 1],
            [3, 1, 2, 3],
            [4, 5, 10, 20, 99],
        ];
        const result = sortNodes(nodes, 0xff);
        expect(result).toEqual(sortedNodes);
    });

    test('sortNodes sorts unsorted nodes in place', () => {
        const nodes: (Uint32Array | number[])[] = [
            new Uint32Array([3, 3, 2, 1]),
            new Uint32Array([4, 10, 5, 20, 99]),
            Uint32Array.from([3, 5, 15, 25]),
            [1, 1],
            [3, 1, 3, 2],
            [4, 10, 5, 20, 99],
        ];
        const copy = [...nodes];
        const sortedNodes = [
            Uint32Array.from([3, 1, 2, 3]),
            Uint32Array.from([4, 5, 10, 20, 99]),
            Uint32Array.from([3, 5, 15, 25]),
            [1, 1],
            [3, 1, 2, 3],
            [4, 5, 10, 20, 99],
        ];
        sortNodes(nodes, 0xff);
        expect(copy).toEqual(sortedNodes);
    });
});
