import { readFile, writeFile } from 'fs-extra';
import { genSequence } from 'gensequence';
import * as Trie from '..';
import { resolveSample } from '../../test/samples';
import { consolidate } from '../consolidate';
import { TrieNode } from '../TrieNode';
import { importTrie, serializeTrie } from './importExportV3';

const sampleFile = resolveSample('sampleV3.trie');

describe('Import/Export', () => {
    test('tests serialize / deserialize small sample', () => {
        const trie = Trie.buildTrie(smallSample).root;
        const expected = toTree(trie);
        const data = [...serializeTrie(trie, { base: 10, comment: 'Sample Words' })].join('');
        const root = importTrie(
            data
                .replace(/\[\d+\]/g, '')
                .split('\n')
                .map((a) => (a ? a + '\r\n' : a))
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
            }),
        ].join('');
        const root = importTrie(data.split('\n').map((a) => (a ? a + '\n' : a)));
        const words = [...Trie.iteratorTrieWords(root)];
        expect(words).toEqual([...sampleWords].sort());
        await writeFile(sampleFile, data);
    });

    test('tests deserialize from file', async () => {
        const sample = (await readFile(sampleFile, 'utf8')).replace(/\r?\n/g, '\n');
        const root = importTrie(sample.split('\n'));
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
        options
        ${10}
        ${{ base: 10 }}
        ${{ base: 10, optimizeSimpleReferences: true }}
        ${{ base: 10, optimizeSimpleReferences: false }}
    `('serialize DAWG $options', ({ options }) => {
        const trie = Trie.createTriFromList(sampleWords);
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
            for (const c of [...n.c].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
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

const specialCharacters = ['arrow <', 'escape \\', 'eol \n', 'eow $', 'ref #', 'Numbers 0123456789', 'Braces: {}[]()'];

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
