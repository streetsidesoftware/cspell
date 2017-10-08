import {expect} from 'chai';
import {Trie} from './trie';
import {readTrieFile} from './reader.test';
import * as cspellDict from 'cspell-dict-es-es';


let trie: Promise<Trie>;

function getTrie() {
    if (!trie) {
        trie = readTrieFile(cspellDict.getConfigLocation());
    }
    return trie;
}

describe('Validate Spanish Suggestions', () => {
    it('Tests suggestions', () => {
        return getTrie().then(trie => {
            // cspell:ignore Carmjen
            const results = trie.suggestWithCost('carmjen', 10);
            // console.log(JSON.stringify(results));
            const suggestions = results.map(s => s.word);
            expect(suggestions).to.contain('carmen');
            expect(suggestions[0]).to.be.equal('carmen');
        });
    });
});

