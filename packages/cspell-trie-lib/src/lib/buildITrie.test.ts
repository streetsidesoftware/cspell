import { resolve } from 'node:path';

import { describe, expect, test } from 'vitest';

import { readFile } from '../test/reader.test.helper.ts';
import { globalTestFixturesDir } from '../test/samples.ts';
import { buildITrieFromWords } from './buildITrie.ts';
import type { ITrie } from './ITrie.ts';
import { parseDictionaryLines } from './SimpleDictionaryParser.ts';
import { TrieBlobBuilder } from './TrieBlob/TrieBlobBuilder.ts';

describe('buildITrie', () => {
    test('buildITrieFromWords', () => {
        const words = 'one two three'.split(' ');
        const trie = buildITrieFromWords(words, {});
        expect([...trie.words()]).toEqual(words.sort());
    });

    test('issue-5222', async () => {
        const words = [...parseDictionaryLines(await readWordsFile('issues/issue-5222/words.txt'))];
        const setOfWords = new Set(words);

        // console.log('Unique characters:', new Set(words.join('')).size);

        const trieBlob = buildITrieFromWords(words, undefined);
        const trieFast = buildITrieFromWords(words, undefined);

        const builder = new TrieBlobBuilder();
        builder.insert(words);
        const ft = builder.build();

        for (const word of setOfWords) {
            expect(ft.has(word), `Expect to find "${word}" in ft trie`).toBe(true);
            expect(trieBlob.has(word), `Expect to find "${word}" in trieBlob`).toBe(true);
            expect(trieFast.has(word), `Expect to find "${word}" in trieFast`).toBe(true);
        }

        expect(new Set(trieFast.words())).toEqual(setOfWords);
        expect(new Set(trieBlob.words())).toEqual(setOfWords);

        expect(trieBlob.size).toBeGreaterThan(0);
        expect(size(trieBlob)).toBeLessThan(trieBlob.size);
    });
});

function size(trie: ITrie): number {
    // walk the trie and get the approximate size.
    const i = trie.iterate();
    let deeper = true;
    let size = 0;
    for (let r = i.next(); !r.done; r = i.next(deeper)) {
        // count all nodes even though they are not words.
        // because we are not going to all the leaves, this should give a good enough approximation.
        size += 1;
        deeper = r.value.text.length < 5;
    }
    return size;
}

// function normalizeWords(words: string[]): string[] {
//     const setOfWords = new Set(words.map((w) => w.normalize('NFC').trim()));
//     for (const word of words) {
//         const lc = word.toLowerCase();
//         setOfWords.add(lc);
//         setOfWords.add(removeAccents(lc));
//         setOfWords.add(removeAccents(word));
//     }
//     return [...setOfWords]
//         .map((w) => w.trim())
//         .filter((a) => !a)
//         .sort();
// }

// function removeAccents(word: string): string {
//     return word.normalize('NFD').replace(/\p{M}/gu, '');
// }

function readFixtureFile(samplePath: string): Promise<string> {
    return readFile(resolve(globalTestFixturesDir, samplePath), 'utf8');
}

async function readWordsFile(samplePath: string): Promise<string[]> {
    return (await readFixtureFile(samplePath))
        .split('\n')
        .map((a) => a.trim())
        .filter((a) => !!a);
}
