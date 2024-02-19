import { resolve } from 'path';
import { describe, expect, test } from 'vitest';

import { readFile } from '../test/reader.test.helper.js';
import { globalTestFixturesDir } from '../test/samples.js';
import { buildITrieFromWords } from './buildITrie.js';
import type { ITrie } from './ITrie.js';
import { parseDictionaryLines } from './SimpleDictionaryParser.js';
import { FastTrieBlobBuilder } from './TrieBlob/FastTrieBlobBuilder.js';

describe('buildITrie', () => {
    test('buildITrieFromWords', () => {
        const words = 'one two three'.split(' ');
        const trie = buildITrieFromWords(words, {});
        expect([...trie.words()]).toEqual(words);
    });

    test('issue-5222', async () => {
        const words = [...parseDictionaryLines(await readWordsFile('issues/issue-5222/words.txt'))];
        const setOfWords = new Set(words);

        // console.log('Unique characters:', new Set(words.join('')).size);

        const trie = buildITrieFromWords(words);

        const builder = new FastTrieBlobBuilder();
        builder.insert(words);
        const ft = builder.build();

        for (const word of setOfWords) {
            expect(ft.has(word), `Expect to find "${word}" in ft trie`).toBe(true);
            expect(trie.has(word), `Expect to find "${word}" in trie`).toBe(true);
        }

        for (const word of trie.words()) {
            expect(setOfWords.has(word), `Expect to find "${word}"`).toBe(true);
        }

        expect(trie.size).toBeGreaterThan(0);
        expect(size(trie)).toBeLessThan(trie.size);
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
