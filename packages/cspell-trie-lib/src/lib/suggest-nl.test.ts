import { readSampleTrie } from './dictionaries.test.helper';

function getTrie() {
    return readSampleTrie('nl_compound_trie3.trie.gz');
}

const timeout = 5000;
const pTrieNL = getTrie();

describe('Validate Dutch Suggestions', () => {
    // cspell:ignore buurtbewoners
    test('Tests suggestions "buurtbewoners"', async () => {
        const trie = await pTrieNL;
        const results = trie.suggestWithCost('buurtbewoners', 5);
        const suggestions = results.map(s => s.word);
        expect(suggestions).toEqual(expect.arrayContaining(['buurtbewoners']));
        expect(suggestions[0]).toBe('buurtbewoners');
    }, timeout);

    // cspell:ignore burtbewoners burgbewoners
    test('Tests suggestions "burtbewoners"', async () => {
        const trie = await pTrieNL;
        const results = trie.suggestWithCost('burtbewoners', 5);
        const suggestions = results.map(s => s.word);
        expect(suggestions).toEqual(expect.arrayContaining(['buurtbewoners', 'burgbewoners']));
    }, timeout);

    // cspell:ignore buurtbwoners
    test('Tests suggestions "buurtbwoners"', async () => {
        const trie = await pTrieNL;
        const results = trie.suggestWithCost('buurtbwoners', 1);
        const suggestions = results.map(s => s.word);
        expect(suggestions).toEqual(expect.arrayContaining(['buurtbewoners']));
    }, timeout);

    test('Tests suggestions "buurtbewoners"', async () => {
        const trie = await pTrieNL;
        const results = trie.suggestWithCost('buurtbewoners', 1);
        expect(results).toEqual([{ word: 'buurtbewoners', cost: 0}]);
    }, timeout);

    // cspell:ignore mexico stad
    test('Tests suggestions "mexico-stad"', async () => {
        const trie = await pTrieNL;
        const results = trie.suggestWithCost('mexico-stad', 2);
        const suggestions = results.map(s => s.word);
        expect(suggestions).toEqual(expect.arrayContaining(['Mexico-Stad']));
        expect(suggestions).not.toEqual(expect.arrayContaining(['Mexico-stad']));
    }, timeout);
});
