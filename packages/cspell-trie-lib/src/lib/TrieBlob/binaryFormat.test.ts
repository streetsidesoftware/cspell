import { describe, expect, test } from 'vitest';

import { BinaryDataBuilder, BinaryDataReader, BinaryFormat, BinaryFormatBuilder } from './binaryFormat.ts';
import { hexDump } from './hexDump.ts';

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
    const encoder = new TextEncoder();

    const builder = new BinaryFormatBuilder();
    builder
        .addString('header', 'The file header', 'Test Header')
        .addString('section1', 'First section', 'Data1')
        .addString('section2', 'Second section', 'Data2')
        .addUint32('value', 'A uint32 value', 123_456)
        .addUint32ArrayPtr('arrayPtr', 'Pointer to uint32 array')
        .addUint32ArrayPtr('arrayPtr2', 'Pointer to second uint32 array')
        .addUint8ArrayPtr('dataPtr', 'Pointer to uint8 array')
        .addUint8ArrayPtr('utf8Ptr', 'Pointer to uint8 array')
        .addStringPtr('stringPtr', 'Pointer to string data')
        .addStringPtr('unsetStringPtr', 'Pointer to string data');
    const format = builder.build();

    test('BinaryDataBuilder LE', () => {
        const builder = new BinaryDataBuilder(format, 'LE');
        expect(builder).toBeDefined();

        builder.setUint32('value', 0xdead_beef);
        builder.setPtrUint32Array('arrayPtr', new Uint32Array([1, 2, 3, 4, 5]));
        builder.setPtrUint32Array('arrayPtr2', new Uint32Array([10, 20, 30, 40, 50, 60]));
        builder.setPtrUint8Array('dataPtr', new Uint8Array([64, 65, 66, 67, 68]));
        builder.addDataElement(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]), 8);
        builder.setPtrString('stringPtr', 'Hello, World!');
        builder.setPtrUint8Array('utf8Ptr', encoder.encode('UTF-8 Data'));

        const data = builder.build();
        expect(hexDump(data)).toMatchSnapshot();

        const reader = new BinaryDataReader(data, format, 'LE');

        expect(reader.getString('header')).toBe('Test Header');
        expect(reader.getString('section1')).toBe('Data1');
        expect(reader.getString('section2')).toBe('Data2');
        expect(reader.getPtrString('stringPtr')).toBe('Hello, World!');
        expect(reader.getString('stringPtr')).toBe('Hello, World!');
        expect(reader.getString('utf8Ptr')).toBe('UTF-8 Data');
        expect(reader.getString('unsetStringPtr')).toBe('');
        expect(reader.getPtrUint8Array('utf8Ptr')).toEqual(encoder.encode('UTF-8 Data'));

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
