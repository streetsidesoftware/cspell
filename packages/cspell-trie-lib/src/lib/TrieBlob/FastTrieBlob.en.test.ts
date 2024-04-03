import { promises as fs } from 'node:fs';

import { opSkip, opTake, pipe } from '@cspell/cspell-pipe/sync';
import { describe, expect, test } from 'vitest';

import { readTrieFromConfig } from '../../test/dictionaries.test.helper.js';
import { FastTrieBlobBuilder } from './FastTrieBlobBuilder.js';

function getTrie() {
    return readTrieFromConfig('@cspell/dict-en_us/cspell-ext.json');
}

const sampleDirUrl = new URL('../../../Samples/', import.meta.url);
const sampleWords: Promise<string[]> = readWordsFile('emoji-sequences.txt');

describe('Validate English FastTrieBlob', async () => {
    const pTrie = getTrie();
    const sampleTrie = await pTrie;
    const sampleWordsLarge = [...pipe(sampleTrie.words(), opSkip(1000), opTake(6000))];
    const fastTrieBlob = FastTrieBlobBuilder.fromTrieRoot(sampleTrie.root);

    test('insert', () => {
        const words = sampleWordsLarge;
        const ft = FastTrieBlobBuilder.fromWordList(words);
        const result = [...ft.words()];
        expect(result).toEqual(words);
    });

    test('has', () => {
        const words = sampleWordsLarge;
        for (const word of words) {
            expect(fastTrieBlob.has(word)).toBe(true);
        }
    });

    test('words', async () => {
        const words = await sampleWords;
        const ft = FastTrieBlobBuilder.fromWordList(words);
        const result = [...ft.words()].sort();

        const rSet = new Set(result);
        const wSet = new Set(words);
        const missing = exclude(wSet, rSet);
        const extra = exclude(rSet, wSet);

        missing.size && console.log('Missing: %o', missing);
        expect(missing.size).toBe(0);
        extra.size && console.log('Extra: %o', extra);
        expect(extra.size).toBe(0);

        expect(result).toEqual(words);
    });
});

function readSampleFile(samplePath: string | URL): Promise<string> {
    return fs.readFile(new URL(samplePath, sampleDirUrl), 'utf8');
}

async function readWordsFile(samplePath: string | URL): Promise<string[]> {
    const text = await readSampleFile(samplePath);
    const words = [...new Set(text.normalize('NFC').split(/[\s\p{P}+~]/gu))].sort().filter((a) => !!a);
    return words;
}

function exclude<T>(a: Set<T>, b: Set<T>): Set<T> {
    a = new Set(a);
    for (const v of b) {
        a.delete(v);
    }
    return a;
}
