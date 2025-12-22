import { describe, expect, test } from 'vitest';

import { BinaryFormat, BinaryFormatBuilder } from './binaryFormat.ts';

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
