import { describe, expect, test } from 'vitest';

import { hexDump } from '../binary/hexDump.ts';
import { decodeStringTableFromBinary, encodeStringTableToBinary, StringTableBuilder } from './StringTable.ts';

describe('StringTableBuilder', () => {
    test('should create a StringTableBuilder instance', () => {
        const builder = new StringTableBuilder();
        expect(builder).toBeDefined();
    });

    test('should build empty StringTable', () => {
        const builder = new StringTableBuilder();
        const table = builder.build();
        expect(table).toBeDefined();
        expect(table.index.length).toBe(0);
        expect(table.charData.length).toBe(0);
    });

    const segments = [
        'hello',
        'world',
        'he',
        'hell',
        'o',
        'ing',
        're',
        'er',
        'run',
        'fall',
        'falling',
        'runs',
        'apple',
        'app',
        'rest',
        'restaurant',
        'take',
        'ake',
        'people',
        'peoples',
        'careful',
        'carefully',
        'caregiver',
        'care',
        'giver',
        'll',
        'el',
        'lo',
        'ref',
    ];

    test('should build StringTable with strings and be able to get them back', () => {
        const builder = new StringTableBuilder();

        const indices = segments.map((s) => builder.addString(s));
        const table = builder.build();

        // console.log(hexDump(table.charData));

        const retrieved = indices.map((i) => table.getString(i));
        expect(retrieved).toEqual(segments);
    });

    test('encode and decode StringTable', () => {
        const builder = new StringTableBuilder();

        const indices = segments.map((s) => builder.addString(s));
        const table = builder.build();

        const encoded = encodeStringTableToBinary(table, 'LE');

        expect(hexDump(encoded)).toMatchSnapshot();

        const decodedTable = decodeStringTableFromBinary(encoded, 'LE');

        const retrieved = indices.map((i) => decodedTable.getString(i));
        expect(retrieved).toEqual(segments);
    });

    test('toJSON', () => {
        const builder = new StringTableBuilder();

        segments.forEach((s) => builder.addString(s));
        const table = builder.build();
        const json = table.toJSON();
        expect(json).toMatchSnapshot();
    });

    test('toString', () => {
        const builder = new StringTableBuilder();

        segments.forEach((s) => builder.addString(s));
        const table = builder.build();
        expect(table.toString()).toMatchSnapshot();
    });
});
