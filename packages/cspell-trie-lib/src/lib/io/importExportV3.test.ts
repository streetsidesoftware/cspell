import { readFile, writeFile } from 'node:fs/promises';

import { beforeAll, describe, expect, test } from 'vitest';

import { resolveSample as resolveSamplePath } from '../../test/samples.js';
import { consolidate } from '../consolidate.js';
import * as Trie from '../index.js';
import type { TrieNode } from '../TrieNode/TrieNode.js';
import { importTrie, serializeTrie } from './importExportV3.js';
import { sampleWords, smallSample, specialCharacters } from './test/sampleData.js';

const sampleFile = resolveSamplePath('sampleV3.trie');
const updateSampleFile = false;

describe('Import/Export', () => {
    beforeAll(async () => {
        if (updateSampleFile) {
            await createSampleFile();
        }
    });

    test('tests serialize / deserialize small sample', () => {
        const trie = Trie.buildTrie(smallSample).root;
        const expected = toTree(trie);
        const data = [...serializeTrie(trie, { base: 10, comment: 'Sample Words' })].join('');
        const root = importTrie(
            data
                .replaceAll(/\[\d+\]/g, '')
                .split('\n')
                .map((a) => (a ? a + '\r\n' : a)),
        );
        const words = [...Trie.iteratorTrieWords(root)];
        expect(words).toEqual([...smallSample].sort());
        const result = toTree(root);
        expect(result).toBe(expected);
    });

    test('tests serialize / deserialize specialCharacters', () => {
        const trie = Trie.buildTrie(specialCharacters).root;
        const data = [...serializeTrie(consolidate(trie), 10)];
        const root = importTrie(data);
        const words = [...Trie.iteratorTrieWords(root)];
        expect(words).toEqual([...specialCharacters].sort());
    });

    test('tests serialize / deserialize', async () => {
        const trie = Trie.buildTrie(sampleWords).root;
        const data = [
            ...serializeTrie(consolidate(trie), {
                base: 10,
                comment: 'Sample Words',
                addLineBreaksToImproveDiffs: false,
            }),
        ].join('');
        const root = importTrie(data.split('\n').map((a) => (a ? a + '\n' : a)));
        const words = [...Trie.iteratorTrieWords(root)];
        expect(words).toEqual([...sampleWords].sort());
    });

    test('tests deserialize from file', async () => {
        const sample = await readFile(sampleFile, 'utf8');
        const root = importTrie(sample);
        const words = [...Trie.iteratorTrieWords(root)];
        expect(words).toEqual([...sampleWords].sort());
    });

    test('tests serialize / deserialize trie', () => {
        const trie = Trie.buildTrie(sampleWords).root;
        const data = serializeTrie(trie, 10);
        const root = importTrie(data);
        const words = [...Trie.iteratorTrieWords(root)];
        expect(words).toEqual([...sampleWords].sort());
    });

    test.each`
        sampleWordList   | options
        ${'sample.txt'}  | ${{ addLineBreaksToImproveDiffs: false }}
        ${'sample2.txt'} | ${{ addLineBreaksToImproveDiffs: false }}
        ${'sample.txt'}  | ${{}}
        ${'sample2.txt'} | ${{}}
    `('Read sample and ensure results match $sampleWordList $options', async ({ sampleWordList, options }) => {
        const path = resolveSamplePath(sampleWordList);
        const content = await readFile(path, 'utf8');
        const wordList = content
            .split('\n')
            .map((a) => a.trim())
            .filter((a) => !!a);

        const trie = Trie.buildTrie(wordList);
        wordList.sort();
        const data = [...serializeTrie(trie.root, options)].join('');
        const trie2 = importTrie(data);
        const wordsTrie = [...Trie.iteratorTrieWords(trie2)];
        expect(wordsTrie).toEqual(wordList);
        expect(data).toMatchSnapshot();
    });

    test.each`
        options
        ${10}
        ${{ base: 10, addLineBreaksToImproveDiffs: false }}
        ${{ base: 10, optimizeSimpleReferences: true, addLineBreaksToImproveDiffs: false }}
        ${{ base: 10, optimizeSimpleReferences: false, addLineBreaksToImproveDiffs: false }}
        ${{ base: 10, optimizeSimpleReferences: true }}
        ${{ base: 10, optimizeSimpleReferences: false }}
    `('serialize DAWG $options', ({ options }) => {
        const trie = Trie.createTrieRootFromList(sampleWords);
        const trieDawg = consolidate(trie);
        const data = [...serializeTrie(trieDawg, options)];
        const root = importTrie(data);
        const words = [...Trie.iteratorTrieWords(root)];
        expect(words).toEqual([...sampleWords].sort());
        expect(data.join('')).toMatchSnapshot();
    });
});

function toTree(root: TrieNode): string {
    function* walk(n: TrieNode, prefix: string): Generator<string> {
        const nextPrefix = '.'.repeat(prefix.length);
        if (n.c) {
            for (const c of Object.entries(n.c).sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
                yield* walk(c[1], prefix + c[0]);
                prefix = nextPrefix;
            }
        }
        if (n.f) {
            yield prefix + '$\n';
        }
    }

    return ['\n', ...walk(root, '')].join('');
}

async function createSampleFile() {
    const trie = Trie.buildTrie(sampleWords).root;
    const data = [
        ...serializeTrie(consolidate(trie), {
            base: 10,
            comment: 'Sample Words',
            addLineBreaksToImproveDiffs: false,
        }),
    ].join('');
    await writeFile(sampleFile, data);
}
