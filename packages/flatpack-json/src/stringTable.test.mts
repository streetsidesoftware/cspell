import { describe, expect, test } from 'vitest';

import { StringTable, StringTableBuilder } from './stringTable.mjs';
import type { StringTableElement } from './types.mjs';

describe('StringTable', () => {
    test('StringTableBuilder', () => {
        const builder = new StringTableBuilder();
        const idx1 = builder.add('apple');
        const idx2 = builder.add('banana');
        const idx3 = builder.add('apple');
        expect(idx1).toBe(idx3);
        expect(builder.get(idx1)).toBe('apple');
        expect(builder.get(idx2)).toBe('banana');
        const stringTableElement = builder.build();
        const stringTable = new StringTable(stringTableElement);
        expect([...stringTable.entries()]).toEqual([
            [1, 'apple'],
            [2, 'banana'],
        ]);
        expect([...stringTable.values()]).toEqual(['apple', 'banana']);

        expect(builder.getRefCount(idx1)).toBe(2);
        expect(builder.getRefCount(idx2)).toBe(1);
    });

    test('StringTableBuilder', () => {
        const builder = new StringTableBuilder();
        const idx1 = builder.add('apple');
        const idx2 = builder.add('banana');
        const idx3 = builder.add('apple');
        expect(idx1).toBe(idx3);
        expect(builder.get(idx1)).toBe('apple');
        expect(builder.get(idx2)).toBe('banana');
        const stringTableElement = builder.build();
        const stringTable = new StringTable(stringTableElement);
        expect([...stringTable.entries()]).toEqual([
            [1, 'apple'],
            [2, 'banana'],
        ]);
        expect([...stringTable.values()]).toEqual(['apple', 'banana']);

        expect(builder.getRefCount(idx1)).toBe(2);
        expect(builder.getRefCount(idx2)).toBe(1);
    });

    test('StringTableBuilder with empty string', () => {
        const builder = new StringTableBuilder();
        const idx1 = builder.add('');
        const idx2 = builder.add('banana');
        expect(idx1).toBe(1);
        expect(builder.get(idx1)).toBe('');
        expect(builder.get(idx2)).toBe('banana');
        expect(builder.getIndex('')).toBe(idx1);
        expect(builder.getIndex('banana')).toBe(idx2);
        const stringTableElement = builder.build();
        const stringTable = new StringTable(stringTableElement);
        expect([...stringTable.entries()]).toEqual([
            [1, ''],
            [2, 'banana'],
        ]);
        expect([...stringTable.values()]).toEqual(['', 'banana']);
    });

    test('StringTableBuilder addRef/clearUnusedEntries selected', () => {
        const stringTableElement: StringTableElement = [128, 'apple', 'banana', [1, 4, 2], '-', 'unused'];
        const builder = new StringTableBuilder(stringTableElement);
        builder.addRef(1);
        builder.addRef(2);
        builder.clearUnusedEntries();
        expect(builder.build()).toEqual([128, 'apple', 'banana', [], [], []]);
        builder.add('orange');
        expect(builder.build()).toEqual([128, 'apple', 'banana', 'orange', [], []]);
    });

    test('StringTableBuilder addRef/clearUnusedEntries', () => {
        const stringTableElement: StringTableElement = [128, 'apple', 'banana', [1, 4, 2], '-', 'unused'];
        const builder = new StringTableBuilder(stringTableElement);
        builder.addRef(3);
        builder.clearUnusedEntries();
        const newStringTableElement = builder.build();
        expect(newStringTableElement).toEqual([128, 'apple', 'banana', [1, 4, 2], '-', []]);
    });

    test('StringTableBuilder sorted by refCount', () => {
        const stringTableElement: StringTableElement = [
            128,
            'apple',
            'banana',
            [1, 4, 2],
            '-',
            'orange',
            'grape',
            'melon',
        ];
        const builder = new StringTableBuilder(stringTableElement);
        expect(builder.add('apple')).toBe(1);
        expect(builder.add('banana')).toBe(2);
        expect(builder.add('apple-banana')).toBe(3);
        expect(builder.add('apple-banana')).toBe(3);
        expect(builder.add('apple-banana')).toBe(3);
        expect(builder.add('orange')).toBe(5);
        expect(builder.add('apple')).toBe(1);
        expect(builder.add('-')).toBe(4);
        expect(builder.add('mango')).toBe(8);
        expect(builder.add('mango')).toBe(8);

        expect(builder.build()).toEqual([...stringTableElement, 'mango']);
        const map = builder.sortEntriesByRefCount();
        expect(builder.build()).toEqual([128, [1, 4, 2], 'apple', 'mango', 'banana', '-', 'orange', 'grape', 'melon']);
        expect(map).toEqual(
            new Map([
                [0, 0],
                [1, 2], // apple
                [2, 4], // banana
                [3, 1], // apple-banana
                [4, 5], // -
                [5, 6], // orange
                [6, 7], // grape
                [7, 8], // melon
                [8, 3], // mango
            ]),
        );
    });
});

describe('StringTable', () => {
    test('StringTable', () => {
        const stringTableElement: StringTableElement = [128, 'apple', 'banana', [1, 4, 2], '-'];
        const stringTable = new StringTable(stringTableElement);
        expect(stringTable.get(1)).toBe('apple');
        expect(stringTable.get(2)).toBe('banana');
        expect(stringTable.get(3)).toBe('apple-banana');
        expect(stringTable.get(4)).toBe('-');
    });

    test('StringTable circular reference', () => {
        const stringTableElement: StringTableElement = [128, 'apple', 'banana', [1, 3, 2], '-'];
        const stringTable = new StringTable(stringTableElement);
        expect(() => stringTable.get(3)).toThrow('Circular reference in string table at index 3');
    });

    test('StringTable compound used multiple times', () => {
        const stringTableElement: StringTableElement = [128, 'apple', 'banana', [1, 4, 2], '-', [3, 4, 3, 4, 3]];
        const stringTable = new StringTable(stringTableElement);
        expect(stringTable.get(5)).toBe('apple-banana-apple-banana-apple-banana');
    });
});
