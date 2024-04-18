import { describe, expect, test } from 'vitest';

import { NumberSequenceByteEncoderDecoder } from './NumberSequenceByteDecoderAccumulator.js';

describe('NumberSequenceByteEncoderDecoder', () => {
    test.each`
        value
        ${0}
        ${1}
        ${255}
        ${1024}
        ${100_000}
    `('encode/decode $value', ({ value }) => {
        const encoded = NumberSequenceByteEncoderDecoder.encode(value);
        const decoded = NumberSequenceByteEncoderDecoder.decode(encoded);
        expect(decoded).toBe(value);
    });

    test('sequence', () => {
        const values = [0, 1, 255, 1024, 100_000, 0x22, 0xfe, 0x1ff, 0xf_ffff];
        const seq = NumberSequenceByteEncoderDecoder.encodeSequence(values);
        const decoded = NumberSequenceByteEncoderDecoder.decodeSequence(seq);
        expect(decoded).toEqual(values);
    });
});
