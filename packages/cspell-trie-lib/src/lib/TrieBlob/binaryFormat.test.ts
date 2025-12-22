/* eslint-disable unicorn/prefer-code-point */
import { describe, expect, test } from 'vitest';

import { BinaryDataBuilder, BinaryDataReader, BinaryFormat, BinaryFormatBuilder } from './binaryFormat.ts';

describe('BinaryFormatBuilder', () => {
    test('should create a BinaryFormatBuilder instance', () => {
        const builder = new BinaryFormatBuilder();
        expect(builder).toBeDefined();
    });

    test('should build empty format', () => {
        const builder = new BinaryFormatBuilder();
        const format = builder.build();
        expect(format).toBeDefined();
        expect(format).toBeInstanceOf(BinaryFormat);
    });

    test('should have the expected format.', () => {
        const builder = new BinaryFormatBuilder();
        builder
            .addString('header', 'The file header', 'Test Header')
            .addString('section1', 'First section', 'Data1')
            .addString('section2', 'Second section', 'Data2')
            .addUint32('value', 'A uint32 value', 123_456);
        const format = builder.build();
        expect(format).toBeDefined();

        expect(format.getField('header')).toBeDefined();
        expect(format.getField('section1')).toBeDefined();
        expect(format.getField('value')).toBeDefined();
        expect(format.getField('nonexistent')).toBeUndefined();
        expect(JSON.stringify(format)).toMatchSnapshot();
        expect(format.toString()).toMatchSnapshot();
    });
});

describe('BinaryDataBuilder', () => {
    const builder = new BinaryFormatBuilder();
    builder
        .addString('header', 'The file header', 'Test Header')
        .addString('section1', 'First section', 'Data1')
        .addString('section2', 'Second section', 'Data2')
        .addUint32('value', 'A uint32 value', 123_456)
        .addPtrUint32Array('arrayPtr', 'Pointer to uint32 array')
        .addPtrUint32Array('arrayPtr2', 'Pointer to second uint32 array');
    const format = builder.build();

    test('BinaryDataBuilder LE', () => {
        const builder = new BinaryDataBuilder(format, 'LE');
        expect(builder).toBeDefined();

        builder.setUint32('value', 0xdead_beef);
        builder.setPtrUint32Array('arrayPtr', new Uint32Array([1, 2, 3, 4, 5]));
        builder.setPtrUint32Array('arrayPtr2', new Uint32Array([10, 20, 30, 40, 50, 60]));

        const data = builder.build();
        expect(hexDump(data)).toMatchSnapshot();

        const reader = new BinaryDataReader(data, format, 'LE');

        expect(reader.getString('header')).toBe('Test Header');
        expect(reader.getString('section1')).toBe('Data1');
        expect(reader.getString('section2')).toBe('Data2');

        const val = reader.getUint32('value');
        expect(val).toBe(0xdead_beef);

        const arr1 = reader.getPtrUint32Array('arrayPtr');
        expect(arr1).toEqual(new Uint32Array([1, 2, 3, 4, 5]));

        const arr2 = reader.getPtrUint32Array('arrayPtr2');
        expect(arr2).toEqual(new Uint32Array([10, 20, 30, 40, 50, 60]));
    });

    test('BinaryDataBuilder BE', () => {
        const builder = new BinaryDataBuilder(format, 'BE');
        expect(builder).toBeDefined();

        builder.setUint32('value', 0xdead_beef);
        builder.setPtrUint32Array('arrayPtr', new Uint32Array([1, 2, 3, 4, 5]));
        builder.setPtrUint32Array('arrayPtr2', new Uint32Array([10, 20, 30, 40, 50, 60]));

        const data = builder.build();
        expect(hexDump(data)).toMatchSnapshot();

        const reader = new BinaryDataReader(data, format, 'BE');

        expect(reader.getString('header')).toBe('Test Header');
        expect(reader.getString('section1')).toBe('Data1');
        expect(reader.getString('section2')).toBe('Data2');

        const val = reader.getUint32('value');
        expect(val).toBe(0xdead_beef);

        const arr1 = reader.getPtrUint32Array('arrayPtr');
        expect(arr1).toEqual(new Uint32Array([1, 2, 3, 4, 5]));

        const arr2 = reader.getPtrUint32Array('arrayPtr2');
        expect(arr2).toEqual(new Uint32Array([10, 20, 30, 40, 50, 60]));
    });
});

function hexDump(buffer: Uint8Array): string {
    function hexLine(offset: number, chunk: Uint8Array): string {
        const hex = [...chunk].map((b) => b.toString(16).padStart(2, '0')).join(' ');
        const ascii = [...chunk].map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.')).join('');
        return offset.toString(16).padStart(8, '0') + '  ' + hex.padEnd(48, ' ') + '  ' + ascii;
    }

    const lines: string[] = [];
    const chunkSize = 16;
    for (let i = 0; i < buffer.length; i += chunkSize) {
        const chunk = buffer.subarray(i, i + chunkSize);
        lines.push(hexLine(i, chunk));
    }
    return lines.join('\n');
}
