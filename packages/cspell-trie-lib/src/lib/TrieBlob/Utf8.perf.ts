import { suite } from 'perf-insight';

import {
    decodeUtf8ByteStream,
    decodeUtf8N_BE,
    decodeUtf8N_LE,
    encodeCodePointsToUtf8Into,
    encodeTextToUtf8,
    encodeTextToUtf8Into,
    encodeUtf8N_BE,
    encodeUtf8N_LE,
    textToCodePoints,
} from './Utf8.js';

suite('Utf8 encode/decode', async (test) => {
    const iterations = 1000;
    const text = sampleText();
    const words = text.split(/\s+/).filter((a) => !!a);
    const wordsCP = words.map((word) => [...word].map((char) => char.codePointAt(0) || 0));
    const chars = [...text];
    const codePoints = chars.map((char) => char.codePointAt(0) || 0);
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const scratchBuffer = new Uint8Array(1024);

    test('TextEncoder.encode/decode to Uint8Array', () => {
        for (let i = iterations; i > 0; --i) {
            for (const char of chars) {
                decoder.decode(encoder.encode(char));
            }
        }
    });

    test('TextEncoder.encode/decode to Uint8Array buffered', () => {
        const buffer = new Uint8Array(scratchBuffer.buffer, 0, 4);
        for (let i = iterations; i > 0; --i) {
            for (const char of chars) {
                buffer[0] = 0;
                encoder.encodeInto(char, buffer);
                decoder.decode();
            }
        }
    });

    test('TextEncoder.encodeInto by char', () => {
        const buffer = new Uint8Array(scratchBuffer.buffer, 0, 4);
        for (let i = iterations; i > 0; --i) {
            for (const char of chars) {
                buffer[0] = 0;
                encoder.encodeInto(char, buffer);
            }
        }
    });

    test('encodeUtf8N_BE', () => {
        for (let i = iterations; i > 0; --i) {
            for (const char of chars) {
                const cp = char.codePointAt(0) || 0;
                const u8 = encodeUtf8N_BE(cp);
                const dcp = decodeUtf8N_BE(u8);
                String.fromCodePoint(dcp);
            }
        }
    });

    test('encodeUtf8N_LE', () => {
        for (let i = iterations; i > 0; --i) {
            for (const char of chars) {
                const cp = char.codePointAt(0) || 0;
                const u8 = encodeUtf8N_LE(cp);
                const dcp = decodeUtf8N_LE(u8);
                String.fromCodePoint(dcp);
            }
        }
    });

    test('TextEncoder.encodeInto text', () => {
        const buffer = scratchBuffer;
        const _text = text;
        for (let i = iterations; i > 0; --i) {
            encoder.encodeInto(_text, buffer);
        }
    });

    test('Buffer.write text', () => {
        const buffer = Buffer.from(scratchBuffer.buffer);
        // const _text = text;
        for (let i = iterations; i > 0; --i) {
            buffer.write(text, 'utf16le');
        }
    });

    test('encodeCodePointsInto', () => {
        const buffer = scratchBuffer;
        const points = codePoints;
        for (let i = iterations; i > 0; --i) {
            encodeCodePointsToUtf8Into(points, buffer);
        }
    });

    test(`TextEncoder.encodeInto words (${words.length})`, () => {
        const buffer = scratchBuffer;
        const _words = words;
        for (let i = iterations; i > 0; --i) {
            for (const word of _words) {
                encoder.encodeInto(word, buffer);
            }
        }
    });

    test(`encodeCodePointsInto wordsCP (${words.length})`, () => {
        const buffer = scratchBuffer;
        const words = wordsCP;
        for (let i = iterations; i > 0; --i) {
            for (const points of words) {
                encodeCodePointsToUtf8Into(points, buffer);
            }
        }
    });

    test(`encodeCodePointsInto Array wordsCP (${words.length})`, () => {
        const buffer = new Array(100);
        const words = wordsCP;
        for (let i = iterations; i > 0; --i) {
            for (const points of words) {
                encodeCodePointsToUtf8Into(points, buffer);
            }
        }
    });

    test(`encodeCodePointsInto wordsCP .codePointAt (${words.length})`, () => {
        const buffer = scratchBuffer;
        const _words = words;
        for (let i = iterations; i > 0; --i) {
            for (const word of _words) {
                encodeCodePointsToUtf8Into(
                    [...word].map((a) => a.codePointAt(0) || 0),
                    buffer,
                );
            }
        }
    });

    test(`encodeTextToUtf8Into Uint8Array words (${words.length})`, () => {
        const buffer = scratchBuffer;
        const _words = words;
        for (let i = iterations; i > 0; --i) {
            for (const word of _words) {
                encodeTextToUtf8Into(word, buffer);
            }
        }
    });

    test(`encodeTextToUtf8Into array words (${words.length})`, () => {
        const buffer = new Array(100);
        const _words = words;
        for (let i = iterations; i > 0; --i) {
            for (const word of _words) {
                encodeTextToUtf8Into(word, buffer);
            }
        }
    });

    test(`encoder.encode(word) to array words (${words.length})`, () => {
        const _words = words;
        for (let i = iterations; i > 0; --i) {
            for (const word of _words) {
                [...encoder.encode(word)];
            }
        }
    });

    test(`encodeTextToUtf8 array words (${words.length})`, () => {
        const _words = words;
        for (let i = iterations; i > 0; --i) {
            for (const word of _words) {
                encodeTextToUtf8(word);
            }
        }
    });

    const charToUtf8Map = new Map<string, number[]>(
        [...new Set([...sampleText()])].map((char) => [char, encodeTextToUtf8(char)] as const),
    );

    test(`encodeTextToUtf8 to array with lookup (${words.length})`, () => {
        const _words = words;
        for (let i = iterations; i > 0; --i) {
            for (const word of _words) {
                const a: number[] = new Array(word.length * 2);
                let i = 0;
                for (const c of word) {
                    const u8 = charToUtf8Map.get(c);
                    for (const u of u8 || []) {
                        a[i++] = u;
                    }
                }
                a.length = i;
            }
        }
    });

    test('textToCodePoints', () => {
        const _text = text;
        for (let i = iterations; i > 0; --i) {
            textToCodePoints(_text);
        }
    });

    test('textToCodePoints map', () => {
        const _text = text;
        for (let i = iterations; i > 0; --i) {
            [..._text].map((a) => a.codePointAt(0) || 0);
        }
    });
});

suite('Utf8 decode buffer', async (test) => {
    const iterations = 1000;
    const text = sampleText();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const bytes = encoder.encode(text);

    test('TextDecoder.decode to string', () => {
        for (let i = iterations; i > 0; --i) {
            decoder.decode(bytes);
        }
    });

    test('decodeUtf8ByteStream to string', () => {
        for (let i = iterations; i > 0; --i) {
            String.fromCodePoint(...decodeUtf8ByteStream(bytes));
        }
    });

    test('decodeUtf8ByteStream to string', () => {
        for (let i = iterations; i > 0; --i) {
            decodeUtf8ByteStream(bytes);
        }
    });
});

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
