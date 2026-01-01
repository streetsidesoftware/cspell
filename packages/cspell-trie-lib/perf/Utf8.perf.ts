import { Buffer } from 'node:buffer';

import { suite } from 'perf-insight';

import {
    decodeUtf8_32,
    decodeUtf8_32Rev,
    decodeUtf8ByteStream,
    encodeCodePointsToUtf8Into,
    encodeTextToUtf8,
    encodeTextToUtf8Into,
    encodeToUtf8_32,
    encodeToUtf8_32Rev,
    textToCodePoints,
} from '../src/lib/TrieBlob/Utf8.ts';
import { Utf8Encoder, Utf8Encoder2 } from '../src/lib/TrieBlob/Utf8Encoder.ts';

const iterations = 1000;
const text = sampleText();
const words = text.split(/\s+/).filter((a) => !!a);

suite('Utf8 encode', async (test) => {
    const encoder = new TextEncoder();
    const scratchBuffer = new Uint8Array(1024);
    const utf8Encoder = new Utf8Encoder();
    const utf8Encoder2 = new Utf8Encoder2(1024);

    test(`TextEncoder.encodeInto words (${words.length})`, () => {
        const buffer = scratchBuffer;
        const _words = words;
        for (let i = iterations; i > 0; --i) {
            for (const word of _words) {
                encoder.encodeInto(word, buffer);
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

    test(`encoder.encode(word) words (${words.length})`, () => {
        const _words = words;
        for (let i = iterations; i > 0; --i) {
            for (const word of _words) {
                encoder.encode(word);
            }
        }
    });

    test(`encoder.encode(word) words cached (${words.length})`, () => {
        const _words = words;
        const map = new Map<string, Uint8Array>();
        for (let i = iterations; i > 0; --i) {
            for (const word of _words) {
                const r = map.get(word);
                if (r) {
                    continue;
                }
                map.set(word, encoder.encode(word));
            }
        }
    });

    test(`encoder.encode(word) words cached obj (${words.length})`, () => {
        const _words = words;
        const map: Record<string, Uint8Array> = Object.create(null);
        for (let i = iterations; i > 0; --i) {
            for (const word of _words) {
                const r = map[word];
                if (r) {
                    continue;
                }
                map[word] = encoder.encode(word);
            }
        }
    });

    test(`cached in obj baseline (${words.length})`, () => {
        const _words = words;
        const map: Record<string, unknown> = Object.create(null);
        for (let i = iterations; i > 0; --i) {
            for (const word of _words) {
                const r = map[word];
                if (r) {
                    continue;
                }
                map[word] = word;
            }
        }
    });

    test(`encoder.encodeInto(word, buffer) words (${words.length})`, () => {
        const buffer = scratchBuffer;
        const _words = words;
        for (let i = iterations; i > 0; --i) {
            for (const word of _words) {
                encoder.encodeInto(word, buffer);
            }
        }
    });

    test(`utf8Encoder(word) to array words (${words.length})`, () => {
        const _words = words;
        for (let i = iterations; i > 0; --i) {
            for (const word of _words) {
                utf8Encoder.encode(word);
            }
        }
    });

    test(`utf8Encoder2(word) to array words (${words.length})`, () => {
        const _words = words;
        for (let i = iterations; i > 0; --i) {
            for (const word of _words) {
                utf8Encoder2.encode(word);
            }
        }
    });

    test(`toUtf8Array(word) to array words (${words.length})`, () => {
        const _words = words;
        for (let i = iterations; i > 0; --i) {
            for (const word of _words) {
                toUtf8Array(word);
            }
        }
    });

    test(`toCodePoints(word) to array words (${words.length})`, () => {
        const _words = words;
        for (let i = iterations; i > 0; --i) {
            for (const word of _words) {
                toCodePoints(word);
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

    test('Buffer.write(word) words ', () => {
        const buffer = Buffer.from(scratchBuffer.buffer);
        const _words = words;
        for (let i = iterations; i > 0; --i) {
            for (const word of _words) {
                buffer.write(word, 0);
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
});

suite('Utf8 encode/decode', async (test) => {
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
                const r = encoder.encodeInto(char, buffer);
                const b = new Uint8Array(buffer.buffer, buffer.byteOffset, r.written);
                decoder.decode(b);
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
                const u8 = encodeToUtf8_32(cp);
                const dcp = decodeUtf8_32(u8);
                String.fromCodePoint(dcp);
            }
        }
    });

    test('encodeUtf8N_LE', () => {
        for (let i = iterations; i > 0; --i) {
            for (const char of chars) {
                const cp = char.codePointAt(0) || 0;
                const u8 = encodeToUtf8_32Rev(cp);
                const dcp = decodeUtf8_32Rev(u8);
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

    test('Buffer.write text "utf16le"', () => {
        const buffer = Buffer.from(scratchBuffer.buffer);
        // const _text = text;
        for (let i = iterations; i > 0; --i) {
            buffer.write(text, 'utf16le');
        }
    });

    test('Buffer.write text ', () => {
        const buffer = Buffer.from(scratchBuffer.buffer);
        // const _text = text;
        for (let i = iterations; i > 0; --i) {
            buffer.write(text);
        }
    });

    test('encodeCodePointsInto', () => {
        const buffer = scratchBuffer;
        const points = codePoints;
        for (let i = iterations; i > 0; --i) {
            encodeCodePointsToUtf8Into(points, buffer);
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

const textEncoder = new TextEncoder();
const charMap: Record<string, number> = Object.create(null);

function encodeChar(char: string): number {
    const bytes = textEncoder.encode(char);
    let code = 0;
    for (let i = bytes.length - 1; i >= 0; i--) {
        code = (code << 8) | bytes[i];
    }
    return code;
}

function toUtf8Array(text: string): number[] {
    const src: string[] = [...text];
    const dst: number[] = src as unknown as number[];

    for (let i = 0; i < src.length; i++) {
        const char = src[i];
        let code = charMap[char];
        if (code === undefined) {
            code = encodeChar(char);
            charMap[char] = code;
        }
        dst[i] = code;
    }
    return dst;
}

function toCodePoints(text: string): number[] {
    const src: string[] = [...text];
    const dst: number[] = src as unknown as number[];

    for (let i = 0; i < src.length; i++) {
        const char = src[i];
        dst[i] = char.codePointAt(0) || 0;
    }
    return dst;
}
