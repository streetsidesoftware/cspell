import { readTrie } from './dictionaries.test.helper';

function getTrie() {
    return readTrie('@cspell/dict-es-es/cspell-ext.json');
}

describe('Validate Spanish Suggestions', () => {
    test('Tests suggestions', async () => {
        jest.setTimeout(5000);
        const trie = await getTrie();
        // cspell:ignore Carmjen
        const results = trie.suggestWithCost('carmjen', 10);
        // console.log(JSON.stringify(results));
        const suggestions = results.map((s) => s.word);
        expect(suggestions).toContain('carmen');
        expect(suggestions[0]).toEqual('carmen');
    });
});
