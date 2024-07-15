import assert from 'node:assert';

import { describe, expect, test } from 'vitest';

import {
    decodeUtf8ByteStream,
    decodeUtf8N_BE,
    decodeUtf8N_LE,
    encodeUtf8N_BE,
    encodeUtf8N_LE,
    hex32,
    Utf8Accumulator,
} from './Utf8.js';

describe('Utf8 lib', () => {
    const encoder = new TextEncoder();

    test('encode/decode', () => {
        const buffer = new ArrayBuffer(4);
        const buf8 = new Uint8Array(buffer);
        const buf32 = new Uint32Array(buffer);
        const view = new DataView(buffer);

        const text = sampleText();
        const characters = [...text];
        for (const char of characters) {
            const codePoint = char.codePointAt(0);
            assert(codePoint !== undefined);
            buf32[0] = 0;
            encoder.encodeInto(char, buf8);
            const expectedUtf8_BE = extractUtf8BE(view);

            const utf8BE = encodeUtf8N_BE(codePoint);

            expect(utf8BE).toBe(expectedUtf8_BE);
            expect(decodeUtf8N_BE(utf8BE)).toBe(codePoint);

            const expectedUtf8_LE = view.getUint32(0, true);
            const utf8LE = encodeUtf8N_LE(codePoint);

            expect(utf8LE).toBe(expectedUtf8_LE);
            expect(decodeUtf8N_LE(utf8LE)).toBe(codePoint);
        }
    });

    test.each`
        value          | expected
        ${0xff}        | ${'0x0000_00ff'}
        ${0xff00_00ff} | ${'0xff00_00ff'}
        ${-2}          | ${'0xffff_fffe'}
    `('hex32 $value', ({ value, expected }) => {
        expect(hex32(value)).toBe(expected);
    });
});

describe('Utf8Accumulator', () => {
    const encoder = new TextEncoder();

    test.each`
        text    | expected
        ${'a'}  | ${[0x61]}
        ${'ab'} | ${[0x61, 0x62]}
        ${'é'}  | ${[undefined, 'é'.codePointAt(0)]}
        ${'∞'}  | ${[undefined, undefined, '∞'.codePointAt(0)]}
    `('Utf8Accumulator $text', ({ text, expected }) => {
        const data = encoder.encode(text);
        const acc = new Utf8Accumulator();
        const r = [...data].map((d) => {
            const v = acc.add(d);
            console.log('%o', acc);
            return v;
        });
        expect(r).toEqual(expected);
    });

    test('decodeUtf8ByteStream', () => {
        const text = sampleText();
        const encoder = new TextEncoder();
        const data = encoder.encode(text);

        expect([...decodeUtf8ByteStream(data)]).toEqual([...text].map((c) => c.codePointAt(0)));
    });
});

function extractUtf8BE(view: DataView): number {
    let v = view.getUint32(0, false);
    for (let i = 0; i < 4; ++i) {
        if (v & 0xff) return v;
        v >>>= 8;
    }
    return v;
}

function sampleText() {
    // cspell:disable
    return `
    import { describe, expect, test } from 'vitest';
    Sample Chinese text: 你好世界
    Sample Japanese text: こんにちは世界
    Sample Korean text: 안녕하세요 세계
    Sample Russian text: Привет мир
    Sample Arabic text: مرحبا بالعالم
    Sample Greek text: Γειά σου Κόσμε
    Sample Hebrew text: שלום עולם
    Sample Hindi text: नमस्ते दुनिया
    Sample Thai text: สวัสดีโลก
    Sample Vietnamese text: Chào thế giới
    Sample English text: Hello World
    Sample Spanish text: Hola Mundo
    Sample Emoji text: 😊🌍🌎🌏
    //     Sample Flags text: 🇺🇸🇨🇳🇯🇵🇰🇷🇷🇺🇮🇳🇹🇭🇻🇳
    `;
    // cspell:enable
}

// cspell:ignoreRegExp /0x[0-9a-f_]+/g
