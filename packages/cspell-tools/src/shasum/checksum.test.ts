import { readFile } from 'node:fs/promises';

import { describe, expect, test } from 'vitest';

import { resolvePathToFixture } from '../test/TestHelper.js';
import { calcChecksum, calcFileChecksum, checkChecksum, checkFile } from './checksum.js';

describe('checksum', () => {
    test('calcChecksum', () => {
        const sum = calcChecksum(Buffer.from(sampleContent()));
        expect(sum).toEqual('3a6b55a089d018878e8b904f8f19391f2e30b66c');
    });

    test.each`
        file                      | checksum
        ${'dicts/colors.txt'}     | ${'3a6b55a089d018878e8b904f8f19391f2e30b66c'}
        ${'dicts/cities.trie.gz'} | ${'963a65138d4391c8de2f0dfb5a7ef890e512a95e'}
    `('checkChecksum', async ({ file, checksum }) => {
        const buf = await readFile(resolvePathToFixture(file));
        expect(checkChecksum(checksum, buf)).toBe(true);
    });

    test.each`
        file                      | checksum
        ${'dicts/colors.txt'}     | ${'3a6b55a089d018878e8b904f8f19391f2e30b66c'}
        ${'dicts/cities.trie.gz'} | ${'963a65138d4391c8de2f0dfb5a7ef890e512a95e'}
    `('calcFileChecksum $file', async ({ file, checksum }) => {
        expect(await calcFileChecksum(resolvePathToFixture(file))).toBe(checksum);
    });

    test.each`
        file                      | checksum
        ${'dicts/colors.txt'}     | ${'3a6b55a089d018878e8b904f8f19391f2e30b66c'}
        ${'dicts/cities.trie.gz'} | ${'963a65138d4391c8de2f0dfb5a7ef890e512a95e'}
    `('checkFile $file', async ({ file, checksum }) => {
        expect(await checkFile(checksum, resolvePathToFixture(file))).toBe(true);
    });
});

function sampleContent(): string {
    return `\
black
blue
cyan
green
magenta
orange
pink
purple
red
white
yellow
`;
}
