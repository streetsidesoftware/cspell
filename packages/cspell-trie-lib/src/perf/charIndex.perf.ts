import { suite } from 'perf-insight';

import { encodeTextToUtf8 } from '../lib/TrieBlob/Utf8.js';
import { readFastTrieBlobFromConfig, readTrieFromConfig } from '../test/dictionaries.test.helper.js';

// const measureTimeout = 100;

const getTrie = memorize(_getTrie);
const getFastTrieBlob = memorize(_getFastTrieBlob);
const getWords = memorize(async () => [...(await getTrie()).words()]);

suite('encode to sequence', async (test) => {
    const words = await getWords();
    const msgSuffix = ' - ' + words.length + ' words';
    const fastTrieBlob = await getFastTrieBlob();
    const trieBlob = fastTrieBlob.toTrieBlob();
    const charIndex = trieBlob.charIndex;
    const encoder = new TextEncoder();

    test('fastTrieBlob.wordToNodeCharIndexSequence' + msgSuffix, () => {
        for (const word of words) {
            fastTrieBlob.wordToUtf8Seq(word);
        }
    });

    test('trieBlob.wordToNodeCharIndexSequence' + msgSuffix, () => {
        for (const word of words) {
            trieBlob.wordToUtf8Seq(word);
        }
    });

    test('trieBlob.wordToNodeCharIndexSequence x4' + msgSuffix, () => {
        for (const word of words) {
            for (let i = 0; i < 4; ++i) {
                trieBlob.wordToUtf8Seq(word);
            }
        }
    });

    test('charIndex.wordToCharIndexSequence' + msgSuffix, () => {
        for (const word of words) {
            charIndex.wordToUtf8Seq(word);
        }
    });

    test('encodeTextToUtf8' + msgSuffix, () => {
        for (const word of words) {
            encodeTextToUtf8(word);
        }
    });

    test('TextEncoder.encode to Uint8Array' + msgSuffix, () => {
        for (const word of words) {
            encoder.encode(word);
        }
    });

    const buffer = new ArrayBuffer(1024);
    const u8buffer = new Uint8Array(buffer);

    test('TextEncoder.encodeInto to Uint8Array' + msgSuffix, () => {
        for (const word of words) {
            encoder.encodeInto(word, u8buffer);
        }
    });

    test('TextEncoder.encodeInto to Uint8Array slice' + msgSuffix, () => {
        let s: Uint8Array | undefined;
        for (const word of words) {
            const n = encoder.encodeInto(word, u8buffer);
            s = u8buffer.slice(0, n.written);
        }
        return s;
    });

    test('TextEncoder.encodeInto to Uint8Array from buffer' + msgSuffix, () => {
        let s: Uint8Array | undefined;
        for (const word of words) {
            const n = encoder.encodeInto(word, u8buffer);
            s = new Uint8Array(buffer, 0, n.written);
        }
        return s;
    });

    test('Normalize("NFC")' + msgSuffix, () => {
        for (const word of words) {
            word.normalize('NFC');
        }
    });

    test('Normalize("NFD")' + msgSuffix, () => {
        for (const word of words) {
            word.normalize('NFD');
        }
    });
});

suite('Buffers and Type Arrays', async (test) => {
    const buffer = new ArrayBuffer(16 * 1024);
    const uint8Array = new Uint8Array(buffer);
    const iterations = 100_000;

    test('Uint8Array from buffer' + ' - ' + buffer.byteLength + ' bytes', () => {
        for (let i = iterations; i > 0; --i) {
            new Uint8Array(buffer);
        }
    });

    test('Uint8Array from buffer + offset' + ' - ' + buffer.byteLength + ' bytes', () => {
        for (let i = iterations; i > 0; --i) {
            new Uint8Array(buffer, 1024, 2048);
        }
    });

    test('Uint8Array from uint8Array.buffer' + ' - ' + buffer.byteLength + ' bytes', () => {
        for (let i = iterations; i > 0; --i) {
            new Uint8Array(uint8Array.buffer);
        }
    });

    test('Uint8Array from uint8Array' + ' - ' + buffer.byteLength + ' bytes', () => {
        for (let i = iterations; i > 0; --i) {
            new Uint8Array(uint8Array);
        }
    });
});

function _getTrie() {
    return readTrieFromConfig('@cspell/dict-en_us/cspell-ext.json');
}

function _getFastTrieBlob() {
    return readFastTrieBlobFromConfig('@cspell/dict-en_us/cspell-ext.json');
}

function memorize<T, P extends []>(fn: (...p: P) => T): (...p: P) => T {
    let p: P | undefined = undefined;
    let r: { v: T } | undefined = undefined;
    return (...pp: P) => {
        if (r && p && p.length === pp.length && p.every((v, i) => v === pp[i])) {
            return r?.v;
        }
        p = pp;
        const v = fn(...pp);
        r = { v };
        return v;
    };
}

// cspell:ignore tion aeiou
