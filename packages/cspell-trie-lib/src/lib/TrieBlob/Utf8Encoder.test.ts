import { beforeEach, describe, expect, it } from 'vitest';

import { Utf8Encoder } from './Utf8Encoder.js';

describe('Utf8Encoder', () => {
    let encoder: Utf8Encoder;

    beforeEach(() => {
        encoder = new Utf8Encoder();
    });

    it('should encode simple ASCII text', () => {
        const result = encoder.encode('hello');
        expect(result).toBeInstanceOf(Uint8Array);
        expect([...result]).toEqual([104, 101, 108, 108, 111]);
    });

    it('should encode UTF-8 text', () => {
        const result = encoder.encode('café');
        expect(result).toBeInstanceOf(Uint8Array);
        expect([...result]).toEqual([99, 97, 102, 195, 169]);
    });

    it('should cache encoded results', () => {
        const result1 = encoder.encode('test');
        const result2 = encoder.encode('test');
        expect(result1).toBe(result2);
    });

    it('should not cache text exceeding threshold', () => {
        const longText = 'a'.repeat(100);
        const result1 = encoder.encode(longText);
        const result2 = encoder.encode(longText);
        expect(result1).not.toBe(result2);
        expect([...result1]).toEqual([...result2]);
    });

    it('should handle empty string', () => {
        const result = encoder.encode('');
        expect(result).toBeInstanceOf(Uint8Array);
        expect(result.length).toBe(0);
    });

    it('should reallocate buffer when full', () => {
        const textEncoder = new TextEncoder();
        const smallEncoder = new Utf8Encoder(32, 8);
        const texts = ['word1', 'word2', 'word3', 'word4', 'word5', 'word6', 'word7', 'word8', 'word9', '你好世界'];
        const w1 = smallEncoder.encode('word1');

        expect(smallEncoder.encode('word1')).toBe(w1); // Cached
        const results = texts.map((t) => smallEncoder.encode(t));
        expect(smallEncoder.encode('word1')).not.toBe(w1); // Not Cached

        results.forEach((result, i) => {
            expect(result).toEqual(textEncoder.encode(texts[i]));
        });
    });

    it('should handle multibyte characters we nearing the buffer size.', () => {
        const textEncoder = new TextEncoder();
        const smallEncoder = new Utf8Encoder(32, 8);
        // Even though the total length is under 32 characters, the multibyte characters cause reallocation.
        const texts = ['word1', 'word2', 'word3', 'word4', 'x', '你好世界'];
        const w1 = smallEncoder.encode('word1');
        const results = texts.map((t) => smallEncoder.encode(t));
        results.forEach((result, i) => {
            expect(result).toEqual(textEncoder.encode(texts[i]));
        });
        // check if the cache was cleared after reallocation
        expect(smallEncoder.encode('word1')).not.toBe(w1); // Cached
    });

    it('should handle custom buffer size', () => {
        const customEncoder = new Utf8Encoder(512);
        const result = customEncoder.encode('custom');
        expect(result).toBeInstanceOf(Uint8Array);
    });

    it('should throw assertion error when threshold exceeds buffer size / 3', () => {
        expect(() => new Utf8Encoder(300, 101)).toThrow();
    });

    it('should allow threshold exactly at buffer size / 3', () => {
        expect(() => new Utf8Encoder(300, 100)).not.toThrow();
    });

    it('should throw assertion error when threshold equals buffer size / 2', () => {
        expect(() => new Utf8Encoder(100, 50)).toThrow();
    });

    it('should handle custom threshold', () => {
        const customEncoder = new Utf8Encoder(1024, 32);
        const shortText = 'short';
        const longText = 'a'.repeat(40);

        const result1 = customEncoder.encode(shortText);
        const result2 = customEncoder.encode(shortText);
        expect(result1).toBe(result2);

        const result3 = customEncoder.encode(longText);
        const result4 = customEncoder.encode(longText);
        expect(result3).not.toBe(result4);
    });

    it('should encode emoji correctly', () => {
        const result = encoder.encode('👍');
        expect(result).toBeInstanceOf(Uint8Array);
        expect([...result]).toEqual([240, 159, 145, 141]);
    });

    it('should handle multiple different strings', () => {
        const texts = ['apple', 'banana', 'cherry'];
        const results = texts.map((t) => encoder.encode(t));

        results.forEach((result, i) => {
            const expected = new TextEncoder().encode(texts[i]);
            expect([...result]).toEqual([...expected]);
        });
    });
});
