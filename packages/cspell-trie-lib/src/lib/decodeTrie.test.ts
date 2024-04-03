import { promises as fs } from 'node:fs';

import { describe, expect, test } from 'vitest';

import { resolveSample } from '../test/samples.js';
import { decodeTrie } from './decodeTrie.js';

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
