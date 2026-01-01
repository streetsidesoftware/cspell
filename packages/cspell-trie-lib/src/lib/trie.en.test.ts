import { describe, expect, test } from 'vitest';

import { readTrieBlobFromConfig, readTrieFromConfig } from '../test/dictionaries.test.helper.ts';
import { ITrieImpl } from './ITrie.ts';
import { memorizeLastCall } from './utils/memorizeLastCall.ts';

const getTrie = memorizeLastCall(_getTrie);

function _getTrie() {
    return readTrieFromConfig('@cspell/dict-en_us/cspell-ext.json');
}

const getFastTrieBlob = memorizeLastCall(_getFastTrieBlob);

async function _getFastTrieBlob() {
    const trie = await readTrieBlobFromConfig('@cspell/dict-en_us/cspell-ext.json');
    return new ITrieImpl(trie);
}

const timeout = 10_000;

describe('Validate English Trie', () => {
    const pTrie = getTrie();
    const pFastTrieBlob = getFastTrieBlob();

    // cspell:ignore setsid macukrainian
    test.each`
        word              | useCompound | expected
        ${'setsid'}       | ${true}     | ${true}
        ${'hello'}        | ${true}     | ${true}
        ${'set'}          | ${true}     | ${true}
        ${'sid'}          | ${true}     | ${true}
        ${'setsid'}       | ${true}     | ${true}
        ${'macukrainian'} | ${true}     | ${true}
        ${'setsid'}       | ${false}    | ${false}
        ${'macukrainian'} | ${false}    | ${false}
    `(
        'has "$word" useCompound: $useCompound',
        async ({ word, expected, useCompound }) => {
            const trie = await pTrie;
            const fastTrieBlob = await pFastTrieBlob;
            expect(trie.has(word, useCompound)).toBe(expected);
            expect(fastTrieBlob.has(word, useCompound)).toBe(expected);
        },
        timeout,
    );

    test.each`
        word              | expected
        ${'hello'}        | ${true}
        ${'set'}          | ${true}
        ${'sid'}          | ${false}
        ${'Sid'}          | ${true}
        ${'setsid'}       | ${false}
        ${'macukrainian'} | ${false}
    `(
        'has "$word" useCompound: $useCompound',
        async ({ word, expected }) => {
            const trie = await pTrie;
            const fastTrieBlob = await pFastTrieBlob;
            expect(trie.has(word)).toBe(expected);
            expect(fastTrieBlob.has(word)).toBe(expected);
        },
        timeout,
    );
});
