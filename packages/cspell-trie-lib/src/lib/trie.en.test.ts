import { readTrie } from '../test/dictionaries.test.helper';

function getTrie() {
    return readTrie('@cspell/dict-en_us/cspell-ext.json');
}

const timeout = 10000;

describe('Validate English Trie', () => {
    const pTrie = getTrie();

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
            expect(trie.has(word, useCompound)).toBe(expected);
        },
        timeout
    );
});
