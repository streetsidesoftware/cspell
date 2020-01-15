import { readSampleTrie } from './dictionaries.test.helper';

function getTrie() {
    return readSampleTrie('nl_compound_trie3.trie.gz');
}

const timeout = 5000;
const pTrieNL = getTrie();

describe('Validate Dutch Suggestions', () => {
    test('Tests suggestions "buurtbewoners"', async () => {
        const trie = await pTrieNL;
        // cspell:ignore buurtbewoners
        const results = trie.suggestWithCost('buurtbewoners', 10);
        // console.log(JSON.stringify(results));
        const suggestions = results.map(s => s.word);
        expect(suggestions).toEqual(expect.arrayContaining(['buurtbewoners']));
        expect(suggestions[0]).toBe('buurtbewoners');
    }, timeout);
});
