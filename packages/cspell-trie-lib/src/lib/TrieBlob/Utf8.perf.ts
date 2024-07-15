import { suite } from 'perf-insight';

import { decodeUtf8ByteStream, decodeUtf8N_BE, decodeUtf8N_LE, encodeUtf8N_BE, encodeUtf8N_LE } from './Utf8.js';

suite('Utf8 encode/decode', async (test) => {
    const iterations = 1000;
    const text = sampleText();
    const chars = [...text];
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
}
