import { readFile } from 'node:fs/promises';

import { describe, expect, test } from 'vitest';

import { resolveSample } from '../../test/samples.js';
import * as Trie from '../index.js';
import { decodeTrieData } from './decode.js';
import { serializeTrie } from './importExport.js';

describe('Import/Export', () => {
    const pSampleWords = readFile(resolveSample('sample.txt'), 'utf8');

    test.each`
        version | base
        ${1}    | ${10}
        ${2}    | ${10}
        ${3}    | ${10}
        ${4}    | ${10}
    `('tests serialize / deserialize version: $version, base: $base', async ({ version, base }) => {
        const sampleWords = (await pSampleWords).split('\n').filter((a) => !!a);
        const trie = Trie.createTrieRootFromList(sampleWords);
        const data = Buffer.from([...serializeTrie(trie, { version, base })].join('\n'));
        const root = decodeTrieData(data);
        const words = [...root.words()];
        expect(words).toEqual([...sampleWords].sort());
    });

    test('tests serialize / deserialize V2', async () => {
        const sampleWords = (await pSampleWords).split('\n').filter((a) => !!a);
        const trie = Trie.createTrieRootFromList(sampleWords);
        const data = [
            ...serializeTrie(trie, {
                version: 2,
                base: 10,
                comment: 'Sample Words',
            }),
        ];
        const root = decodeTrieData(data.join('\n'));
        const words = [...root.words()];
        expect(words).toEqual([...sampleWords].sort());
    });

    test('bad format', async () => {
        const data = 'One\nTwo';
        expect(() => decodeTrieData(data)).toThrow('Unknown file format');
    });

    test('Unsupported version', async () => {
        const sample = await readFile(resolveSample('sampleV2.trie'), 'utf8');
        const data = sample.replace('TrieXv2', 'TrieXv9');
        expect(() => decodeTrieData(data)).toThrow('Unsupported version: 9');
    });
});
