import { promises as fs } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';

import { describe, expect, test } from 'vitest';

import { resolveSample } from '../test/samples.ts';
import { convertToBTrie, decodeFile, decodeTrie } from './decodeTrie.ts';

describe('decodeTrie', () => {
    // cspell:ignore Mormotomyi Hypsoïdes

    test.each`
        file            | expected
        ${'sci.trie'}   | ${['Mormotomyi\uFEFFa', 'Hypsoïdes']}
        ${'sciV1.trie'} | ${['Mormotomyi\uFEFFa', 'Hypsoïdes']}
    `('decode $file', async ({ file, expected }) => {
        const filePath = resolveSample(file);
        const data = await fs.readFile(filePath);
        const trie = decodeTrie(data);
        const words = [...trie.words()];
        expect(words).toEqual(expect.arrayContaining(expected));
    });
});

describe('decodeFile', () => {
    test('decode sci.trie', async () => {
        const filePath = resolveSample('sci.trie');
        const fileUrl = pathToFileURL(filePath);
        const fileResource = {
            url: fileUrl,
            content: await fs.readFile(fileUrl),
        };
        const trie = await decodeFile(fileResource);
        const words = [...trie.words()];
        expect(words).toEqual(expect.arrayContaining(['Mormotomyi\uFEFFa', 'Hypsoïdes']));
    });

    test('decode sci.trie.gz', async () => {
        const filePath = resolveSample('sci.trie');
        const fileUrl = pathToFileURL(filePath);
        fileUrl.pathname += '.gz';
        const fileResource = {
            url: fileUrl,
            content: gzipSync(await fs.readFile(filePath)),
        };
        const trie = await decodeFile(fileResource);
        const words = [...trie.words()];
        expect(words).toEqual(expect.arrayContaining(['Mormotomyi\uFEFFa', 'Hypsoïdes']));
    });
});

describe('convertToBTrie', () => {
    test('convertToBTrie sci.trie', async () => {
        const filePath = resolveSample('sci.trie');
        const fileUrl = pathToFileURL(filePath);
        const fileResource = {
            url: fileUrl,
            content: await fs.readFile(fileUrl),
        };
        const trie = await decodeFile(fileResource);
        const words = [...trie.words()];
        const bTrieFile = await convertToBTrie(fileResource);
        const bTrie = await decodeFile(bTrieFile);
        const bTrieWords = [...bTrie.words()];
        expect(bTrieWords).toEqual(words);
        expect(bTrieFile.url.pathname).toMatch(/sci\.btrie$/);
    });

    test('convertToBTrie sci.trie.gz', async () => {
        const filePath = resolveSample('sci.trie');
        const fileUrl = pathToFileURL(filePath);
        fileUrl.pathname += '.gz';
        const fileResource = {
            url: fileUrl,
            content: gzipSync(await fs.readFile(filePath)),
        };
        const trie = await decodeFile(fileResource);
        const words = [...trie.words()];
        const bTrieFile = await convertToBTrie(fileResource);
        const bTrie = await decodeFile(bTrieFile);
        const bTrieWords = [...bTrie.words()];
        expect(bTrieWords).toEqual(words);
        expect(bTrieFile.url.pathname).toMatch(/sci\.btrie$/);
    });
});
