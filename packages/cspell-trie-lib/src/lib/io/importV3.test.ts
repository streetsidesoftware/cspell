import { readFile } from 'node:fs/promises';

import { genSequence } from 'gensequence';
import { describe, expect, test } from 'vitest';

import { resolveSample as resolveSamplePath } from '../../test/samples.js';
import { consolidate } from '../consolidate.js';
import * as Trie from '../index.js';
import type { ITrieNode } from '../ITrieNode/ITrieNode.js';
import { trieRootToITrieRoot } from '../TrieNode/trie.js';
import { TrieNodeBuilder } from '../TrieNode/TrieNodeBuilder.js';
import { serializeTrie } from './importExportV3.js';
import { importTrieV3AsTrieRoot, importTrieV3WithBuilder } from './importV3.js';

const sampleFile = resolveSamplePath('sampleV3.trie');

const Builder = TrieNodeBuilder;

describe('Import/Export', () => {
    test('tests serialize / deserialize small sample', () => {
        const trie = Trie.buildTrie(smallSample).root;
        const expected = toTree(trieRootToITrieRoot(trie));
        const data = [...serializeTrie(trie, { base: 10, comment: 'Sample Words' })].join('');
        const ft = importTrieV3WithBuilder(
            new Builder(),
            data
                .replace(/\[\d+\]/g, '')
                .split('\n')
                .map((a) => (a ? a + '\r\n' : a)),
        );
        const words = [...ft.words()];
        expect(words).toEqual([...smallSample].sort());
        const result = toTree(ft.iTrieRoot);
        expect(result).toBe(expected);
    });

    test('tests serialize / deserialize small sample', () => {
        const trie = Trie.buildTrie(smallSample).root;
        const expected = toTree(trieRootToITrieRoot(trie));
        const data = [...serializeTrie(trie, { base: 10, comment: 'Sample Words' })].join('');
        const ft = importTrieV3AsTrieRoot(
            data
                .replace(/\[\d+\]/g, '')
                .split('\n')
                .map((a) => (a ? a + '\r\n' : a)),
        );
        const words = [...ft.words()];
        expect(words).toEqual([...smallSample].sort());
        const result = toTree(ft.iTrieRoot);
        expect(result).toBe(expected);
    });

    test('tests serialize / deserialize specialCharacters', () => {
        const trie = Trie.buildTrie(specialCharacters).root;
        const data = [...serializeTrie(consolidate(trie), 10)];
        const ft = importTrieV3WithBuilder(new Builder(), data);
        const words = [...ft.words()];
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
        const ft = importTrieV3WithBuilder(
            new Builder(),
            data.split('\n').map((a) => (a ? a + '\n' : a)),
        );
        const words = [...ft.words()];
        expect(words).toEqual([...sampleWords].sort());
    });

    test('tests deserialize from file', async () => {
        const sample = await readFile(sampleFile, 'utf8');
        const root = importTrieV3WithBuilder(new Builder(), sample);
        const words = [...root.words()];
        expect(words).toEqual([...sampleWords].sort());
    });

    test('tests serialize / deserialize trie', () => {
        const trie = Trie.buildTrie(sampleWords).root;
        const data = serializeTrie(trie, 10);
        const root = importTrieV3WithBuilder(new Builder(), data);
        const words = [...root.words()];
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
        const content = await readFile(path, 'utf-8');
        const wordList = content
            .split('\n')
            .map((a) => a.trim())
            .filter((a) => !!a);

        const trie = Trie.buildTrie(wordList);
        wordList.sort();
        const data = [...serializeTrie(trie.root, options)].join('');
        const ft = importTrieV3WithBuilder(new Builder(), data);
        const wordsTrie = [...ft.words()];
        expect(wordsTrie).toEqual(wordList);
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
        const root = importTrieV3WithBuilder(new Builder(), data);
        const words = [...root.words()];
        expect(words).toEqual([...sampleWords].sort());
    });
});

function toTree(root: ITrieNode): string {
    function* walk(n: ITrieNode, prefix: string): Generator<string> {
        const nextPrefix = '.'.repeat(prefix.length);
        if (n.hasChildren()) {
            const keys = n
                .keys()
                .map((k, i) => ({ k, i }))
                .sort((a, b) => (a.k < b.k ? -1 : 1));
            for (const key of keys) {
                const c = n.child(key.i);
                if (!c) continue;
                yield* walk(c, prefix + key.k);
                prefix = nextPrefix;
            }
        }
        if (n.eow) {
            yield prefix + '$\n';
        }
    }

    return ['\n', ...walk(root, '')].join('');
}

const specialCharacters = [
    'arrow <',
    'escape \\',
    '\\\\\\',
    'eol \n',
    'eow $',
    'ref #',
    'Numbers 0123456789',
    'Braces: {}[]()',
];

const smallSample = genSequence(['lift', 'talk', 'walk', 'turn', 'burn', 'chalk', 'churn'])
    .concatMap(applyEndings)
    .toArray();

const sampleWords = [
    'journal',
    'journalism',
    'journalist',
    'journalistic',
    'journals',
    'journey',
    'journeyer',
    'journeyman',
    'journeymen',
    'joust',
    'jouster',
    'jousting',
    'jovial',
    'joviality',
    'jowl',
    'jowly',
    'joy',
    'joyful',
    'joyfuller',
    'joyfullest',
    'joyfulness',
    'joyless',
    'joylessness',
    'joyous',
    'joyousness',
    'joyridden',
    'joyride',
    'joyrider',
    'joyriding',
    'joyrode',
    'joystick',
    'Big Apple',
    'New York',
    'apple',
    'big apple',
    'fun journey',
    'long walk',
    'fun walk',
]
    .concat(specialCharacters)
    .concat(smallSample);

function applyEndings(s: string): string[] {
    const endings = ['', 'ed', 'er', 'ing', 's'];
    return endings.map((e) => s + e);
}
