import { suite } from 'perf-insight';

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
            fastTrieBlob.wordToNodeCharIndexSequence(word);
        }
    });

    test('trieBlob.wordToNodeCharIndexSequence' + msgSuffix, () => {
        for (const word of words) {
            trieBlob.wordToNodeCharIndexSequence(word);
        }
    });

    test('trieBlob.wordToNodeCharIndexSequence x4' + msgSuffix, () => {
        for (const word of words) {
            for (let i = 0; i < 4; ++i) {
                trieBlob.wordToNodeCharIndexSequence(word);
            }
        }
    });

    test('charIndex.wordToCharIndexSequence' + msgSuffix, () => {
        for (const word of words) {
            charIndex.wordToCharIndexSequence(word);
        }
    });

    test('charIndex.__wordToCharIndexSequence' + msgSuffix, () => {
        for (const word of words) {
            charIndex.__wordToCharIndexSequence(word);
        }
    });

    test('TextEncoder.encode to Uint8Array' + msgSuffix, () => {
        for (const word of words) {
            encoder.encode(word);
        }
    });

    const buffer = new Uint8Array(1024);

    test('TextEncoder.encodeInto to Uint8Array' + msgSuffix, () => {
        for (const word of words) {
            encoder.encodeInto(word, buffer);
        }
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
