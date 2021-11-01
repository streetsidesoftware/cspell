import { readSampleTrie } from './dictionaries.test.helper';

function getTrie() {
    return readSampleTrie('nl_compound_trie3.trie.gz');
}

const timeout = 5000;
const pTrieNL = getTrie();

describe('Validate Dutch Suggestions', () => {
    // cspell:ignore buurtbewoners
    test(
        'Tests suggestions "buurtbewoners"',
        async () => {
            const trie = await pTrieNL;
            const results = trie.suggestWithCost('buurtbewoners', { numSuggestions: 5 });
            const suggestions = results.map((s) => s.word);
            expect(suggestions).toEqual(expect.arrayContaining(['buurtbewoners']));
            expect(suggestions[0]).toBe('buurtbewoners');
        },
        timeout
    );

    // cspell:ignore burtbewoners burgbewoners
    // cspell:ignore buurtbwoners buurtbewoner buurbewoners

    test.each`
        word               | numSuggestions | expected
        ${'Mexico-Stad'}   | ${2}           | ${[sr('Mexico-Stad', 0), sr('mexico-stad', 2)]}
        ${'mexico-stad'}   | ${2}           | ${[sr('mexico-stad', 0), sr('Mexico-Stad', 2)]}
        ${'buurtbewoners'} | ${3}           | ${[sr('buurtbewoners', 0), sr('buurtbewoner', 88), sr('buurbewoners', 96)]}
        ${'burtbewoners'}  | ${2}           | ${ac(sr('burgbewoners', 96), sr('buurtbewoners', 97))}
        ${'buurtbwoners'}  | ${1}           | ${[sr('buurtbewoners', 93)]}
        ${'buurtbewoners'} | ${1}           | ${[sr('buurtbewoners', 0)]}
    `(
        'Tests suggestions $word',
        async ({ word, numSuggestions, expected }) => {
            const trie = await pTrieNL;
            const results = trie.suggestWithCost(word, { numSuggestions });
            expect(results).toEqual(expected);
        },
        timeout
    );

    // cspell:ignore mexico stad
    test(
        'Tests suggestions "mexico-stad"',
        async () => {
            const trie = await pTrieNL;
            const results = trie.suggestWithCost('mexico-stad', { numSuggestions: 2 });
            const suggestions = results.map((s) => s.word);
            expect(suggestions).toEqual(expect.arrayContaining(['Mexico-Stad']));
            expect(suggestions).not.toEqual(expect.arrayContaining(['Mexico-stad']));
        },
        timeout
    );

    function ac<T>(...args: T[]): T[] {
        return expect.arrayContaining(args);
    }

    function sr(word: string, cost: number) {
        return { word, cost };
    }
});
