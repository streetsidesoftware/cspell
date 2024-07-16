import assert from 'node:assert';

import { describe, expect, test } from 'vitest';

import {
    decodeUtf8ByteStream,
    decodeUtf8N_BE,
    decodeUtf8N_LE,
    encodeCodePointsToUtf8Into,
    encodeTextToUtf8,
    encodeUtf8N_BE,
    encodeUtf8N_LE,
    hex32,
    textToCodePoints,
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
        text    | expected
        ${'a'}  | ${[0x61]}
        ${'ab'} | ${[0x61, 0x62]}
        ${'é'}  | ${[195, 169]}
        ${'🇺🇸'} | ${[240, 159, 135, 186, 240, 159, 135, 184]}
    `('encodeTextToUtf8 $text', ({ text, expected }) => {
        expect(encodeTextToUtf8(text)).toEqual(expected);
        expect(encodeTextToUtf8(text)).toEqual([...encoder.encode(text)]);

        const scratch: number[] = [];
        const len = encodeCodePointsToUtf8Into(textToCodePoints(text), scratch);
        expect(scratch.slice(0, len)).toEqual(expected);
    });

    test('encodeCodePointsToUtf8Into', () => {
        const decoder = new TextDecoder();
        const text = sampleText();
        const scratch: number[] = [];
        const len = encodeCodePointsToUtf8Into(textToCodePoints(text), scratch);
        const buf = new Uint8Array(scratch.slice(0, len));
        expect(decoder.decode(buf)).toBe(text);
    });

    test.each`
        text    | expected
        ${'a'}  | ${[0x61]}
        ${'ab'} | ${[0x61, 0x62]}
        ${'é'}  | ${[0xc3a9]}
        ${'🇺🇸'} | ${[0xf09f_87ba, 0xf09f_87b8]}
    `('encodeUtf8N_BE $text', ({ text, expected }) => {
        const utf = textToCodePoints(text).map((cp) => encodeUtf8N_BE(cp));
        expect(utf).toEqual(expected);
        expect(
            String.fromCodePoint(
                ...utf
                    .map((v) => v ^ ~1) // force it to be native
                    .map((v) => v ^ ~1)
                    .map((c) => decodeUtf8N_BE(c)),
            ),
        ).toEqual(text);
    });

    test('decodeUtf8N_BE invalid', () => {
        expect(decodeUtf8N_BE(0xff)).toBe(0xfffd);
    });

    test('decodeUtf8N_LE invalid', () => {
        expect(decodeUtf8N_LE(0xff)).toBe(0xfffd);
    });

    test.each`
        text    | expected
        ${'a'}  | ${[0x61]}
        ${'ab'} | ${[0x61, 0x62]}
        ${'é'}  | ${[0xa9c3]}
        ${'ë'}  | ${[0xabc3]}
        ${'🇺🇸'} | ${[0xba87_9ff0, 0xb887_9ff0]}
    `('encodeUtf8N_LE $text', ({ text, expected }) => {
        const utf = textToCodePoints(text).map((cp) => encodeUtf8N_LE(cp));
        expect(utf).toEqual(expected);
        expect(
            String.fromCodePoint(
                ...utf
                    .map((v) => v ^ ~1) // force it to be native
                    .map((v) => v ^ ~1)
                    .map((c) => decodeUtf8N_LE(c)),
            ),
        ).toEqual(text);
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
            const v = acc.decode(d);
            return v;
        });
        expect(r).toEqual(expected);
    });

    test('decodeUtf8ByteStream', () => {
        const text = sampleText();
        const encoder = new TextEncoder();
        const data = encoder.encode(text);

        expect([...decodeUtf8ByteStream(data)]).toEqual([...text].map((c) => c.codePointAt(0)));

        function* gen() {
            yield* data;
        }
        expect([...decodeUtf8ByteStream(gen())]).toEqual([...text].map((c) => c.codePointAt(0)));
    });

    test('encodeTextToUtf8', () => {
        const text = sampleText();
        expect(encodeTextToUtf8(text)).toEqual([...encoder.encode(text)]);
    });

    test('decodeUtf8ByteStream', () => {
        const text = sampleText();
        expect(String.fromCodePoint(...decodeUtf8ByteStream(encoder.encode(text)))).toBe(text);
    });

    test('Utf8Accumulator isMultiByte', () => {
        expect(Utf8Accumulator.isMultiByte(0x7f)).toBe(false);
        expect(Utf8Accumulator.isMultiByte(0xf0)).toBe(true);
        expect(Utf8Accumulator.isSingleByte(0x7f)).toBe(true);
        expect(Utf8Accumulator.isSingleByte(0xf0)).toBe(false);
    });

    test('Utf8Accumulator', () => {
        const acc = Utf8Accumulator.create();

        expect(acc.decode(0x61)).toBe(0x61);
        expect(acc.decode(0x61)).toBe(0x61);

        // é
        expect(acc.decode(0xc3)).toBe(undefined);
        const cloneAcc = acc.clone();
        expect(acc.decode(0xa9)).toBe('é'.codePointAt(0));
        expect(acc.decode(0x61)).toBe(0x61);
        // ë
        expect(cloneAcc.decode(0xab)).toBe('ë'.codePointAt(0));

        // out of order
        expect(acc.decode(0xa9)).toBe(0xfffd);
        expect(acc.decode(0xc3)).toBe(undefined);
        acc.reset();

        // two leads in a row
        expect(acc.decode(0xc3)).toBe(undefined);
        expect(acc.decode(0xc3)).toBe(0xfffd);
        expect(acc.decode(0xa9)).toBe(0xfffd);

        // two leads in a row
        expect(acc.decode(0xc3)).toBe(undefined);
        acc.reset();
        expect(acc.decode(0xc3)).toBe(undefined);
        expect(acc.decode(0xa9)).toBe('é'.codePointAt(0));
    });
});

describe('textToCodePoints', () => {
    test('textToCodePoints', () => {
        const text = sampleText();
        expect(textToCodePoints(text)).toEqual([...text].map((c) => c.codePointAt(0)));
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
    Sample Flags text: 🇺🇸🇨🇳🇯🇵🇰🇷🇷🇺🇮🇳🇹🇭🇻🇳
    "ትግርኛ",
    "አማርኛ",
    "ພາສາລາວ",
    "ꦧꦱꦗꦮ",
    "ᐃᓄᒃᑎᑐᑦ",
    "ᐊᓂᔑᓈᐯᒧᐎᓐ",
    "ᓀᐦᐃᔭᐍᐏᐣ"
    😀😃😄😁😆🥹😅😂🤣🥲☺️😊😇🙂🙃😉
    😌😍🥰😘😗😙😚😋😛😝😜🤪🤨🧐🤓😎
    🥸🤩🥳😏😒😞😔😟😕🙁☹️😣😖😫😩🥺
    😢😭😤😠😡🤬🤯😳🥵🥶😶‍🌫️😱😨😰😥😓
    🤗🤔🫣🤭🫢🫡🤫🫠🤥😶🫥😐🫤😑🫨😬
    🙄😯😦😧😮😲🥱😴🤤😪😮‍💨😵😵‍💫🤐🥴🤢
    🤮🤧😷🤒🤕🤑🤠😈
    `;
    // cspell:enable
}

// cspell:ignoreRegExp /0x[0-9a-f_]+/g
