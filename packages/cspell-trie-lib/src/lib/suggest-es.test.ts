import {expect} from 'chai';
import { readTrie } from './dictionaries.test';

function getTrie() {
    return readTrie('cspell-dict-es-es');
}

describe('Validate Spanish Suggestions', () => {
    it('Tests suggestions', async function() {
        this.timeout(5000);
        const trie = await getTrie();
        // cspell:ignore Carmjen
        const results = trie.suggestWithCost('carmjen', 10);
        // console.log(JSON.stringify(results));
        const suggestions = results.map(s => s.word);
        expect(suggestions).to.contain('carmen');
        expect(suggestions[0]).to.be.equal('carmen');
    });
});

