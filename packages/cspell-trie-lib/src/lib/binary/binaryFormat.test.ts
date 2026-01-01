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

    test('setPtrUint32Array', () => {
        const format = new BinaryFormatBuilder().addUint32ArrayPtr('arrayPtr', 'Pointer to uint32 array').build();
        const builder = new BinaryDataBuilder(format);
        const arr = new Uint32Array(numberRange(10, 20));
        builder.setPtrUint32Array('arrayPtr', arr);
        const data = builder.build();
        const reader = new BinaryDataReader(data, format);
        const readArr = reader.getPtrUint32Array('arrayPtr');
        expect(readArr).toEqual(arr);
    });

    test('setPtrUint8Array', () => {
        const format = new BinaryFormatBuilder().addUint8ArrayPtr('arrayPtr', 'Pointer to uint8 array').build();
        const builder = new BinaryDataBuilder(format);
        const arr = new Uint8Array(numberRange(10, 20));
        builder.setPtrUint8Array('arrayPtr', arr);
        const data = builder.build();
        const reader = new BinaryDataReader(data, format);
        const readArr = reader.getPtrUint8Array('arrayPtr');
        expect(readArr).toEqual(arr);
    });

    test('setPtrString', () => {
        const format = new BinaryFormatBuilder().addStringPtr('stringPtr', 'Pointer to string data').build();
        const builder = new BinaryDataBuilder(format);
        const str = 'The quick brown fox jumps over the lazy dog.';
        builder.setPtrString('stringPtr', str);
        const data = builder.build();
        const reader = new BinaryDataReader(data, format);
        const readStr = reader.getPtrString('stringPtr');
        expect(readStr).toBe(str);
    });

    test('setPtrString empty', () => {
        const format = new BinaryFormatBuilder().addStringPtr('stringPtr', 'Pointer to string data').build();
        const builder = new BinaryDataBuilder(format);
        const str = '';
        builder.setPtrString('stringPtr', str);
        const data = builder.build();
        const reader = new BinaryDataReader(data, format);
        const readStr = reader.getPtrString('stringPtr');
        expect(readStr).toBe(str);
    });

    test('setPtrUint16Array', () => {
        const format = new BinaryFormatBuilder().addUint16ArrayPtr('arrayPtr', 'Pointer to uint16 array').build();
        const builder = new BinaryDataBuilder(format);
        const arr = new Uint16Array(numberRange(10, 20));
        builder.setPtrUint16Array('arrayPtr', arr);
        const data = builder.build();
        const reader = new BinaryDataReader(data, format);
        const readArr = reader.getPtrUint16Array('arrayPtr');
        expect(readArr).toEqual(arr);
    });

    test('reader.getField', () => {
        const format = new BinaryFormatBuilder()
            .addString('header', 'The file header', 'Test Header')
            .addUint16('value16', 'A uint16 value', 0x1234)
            .addUint32ArrayPtr('arrayPtr', 'Pointer to uint32 array')
            .build();
        const builder = new BinaryDataBuilder(format);
        const arr = new Uint32Array(numberRange(10, 20));
        builder.setPtrUint32Array('arrayPtr', arr);
        const data = builder.build();

        const reader = new BinaryDataReader(data, format);

        // make sure the field matches
        const field = reader.getField('arrayPtr');
        expect(field).toEqual(format.getField('arrayPtr'));
    });

    test('reader.getAsUint16', () => {
        const format = new BinaryFormatBuilder()
            .addString('header', 'The file header', 'Test Header')
            .addUint16('data16', 'A 16-bit value', 0xabcd)
            .addUint8Array('data8', 'An array of uint8', [0x12, 0x34])
            .build();
        const builder = new BinaryDataBuilder(format);
        const data = builder.build();

        const reader = new BinaryDataReader(data, format);

        expect(reader.getUint16('data16')).toBe(0xabcd);

        const expectedUint8Array = reader.endian === 'LE' ? new Uint8Array([0xcd, 0xab]) : new Uint8Array([0xab, 0xcd]);
        const val8 = reader.getUint8Array('data16');
        expect(val8).toEqual(expectedUint8Array);

        const expectedUint16 = reader.endian === 'LE' ? 0x3412 : 0x1234;
        const val16 = reader.getAsUint16('data8');
        expect(val16).toBe(expectedUint16);
    });
});

describe('field overrides', () => {
    test('override addUint32ArrayPtr with addUint16ArrayPtr', () => {
        const format = new BinaryFormatBuilder()
            .addUint32ArrayPtr('arrayPtr32', 'Pointer to uint32 array')
            .addUint16ArrayPtr('arrayPtr16', 'Pointer to uint16 array', 'arrayPtr32')
            .build();
        const builder = new BinaryDataBuilder(format);
        const arr16 = new Uint16Array(numberRange(10, 20));
        builder.setPtrUint16Array('arrayPtr16', arr16);
        const data = builder.build();
        const reader = new BinaryDataReader(data, format);
        const readArr16 = reader.getPtrUint16Array('arrayPtr16');
        expect(readArr16).toEqual(arr16);
    });
});

function numberRange(start: number, end: number): number[] {
    const result: number[] = [];
    for (let i = start; i < end; i++) {
        result.push(i);
    }
    return result;
}
