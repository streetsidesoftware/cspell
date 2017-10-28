import {expect} from 'chai';
import {Trie} from './trie';
import {
    genCompoundableSuggestions,
    CompoundWordsMethod,
    suggestionCollector,
} from './suggest';
import {readTrieFile} from './reader.test';
import * as cspellDict from 'cspell-dict-en_us';


let trie: Promise<Trie>;

function getTrie() {
    if (!trie) {
        trie = readTrieFile(cspellDict.getConfigLocation());
    }
    return trie;
}

const timeout = 10000;

describe('Validate English Suggestions', function() {

    it('Tests suggestions', function() {
        this.timeout(timeout);
        return getTrie().then(trie => {
            const collector = suggestionCollector('joyful', 8, undefined, 1);
            collector.collect(genCompoundableSuggestions(
                trie.root,
                collector.word,
                CompoundWordsMethod.NONE
            ));
            const results = collector.suggestions;
            const suggestions = results.map(s => s.word);
            expect(suggestions).to.contain('joyful');
            expect(suggestions[0]).to.be.equal('joyful');
        });
    });

    it('Tests suggestions', function() {
        this.timeout(timeout);
        return getTrie().then(trie => {
            // cspell:ignore joyfull
            const collector = suggestionCollector('joyfull', 8);
            collector.collect(genCompoundableSuggestions(
                trie.root,
                collector.word,
                CompoundWordsMethod.SEPARATE_WORDS
            ));
            const results = collector.suggestions;
            const suggestions = results.map(s => s.word);
            expect(suggestions).to.contain('joyful');
            expect(suggestions[0]).to.be.equal('joyfully');
            expect(suggestions[1]).to.be.equal('joyful');
            expect(suggestions).to.be.length(collector.maxNumSuggestions);
        });
    });

    it('Tests compound SEPARATE_WORDS suggestions', function() {
        this.timeout(timeout);
        return getTrie().then(trie => {
            // cspell:ignore onetwothreefour
            const collector = suggestionCollector('onetwothreefour', 8, undefined, 3.3);
            collector.collect(genCompoundableSuggestions(
                trie.root,
                collector.word,
                CompoundWordsMethod.SEPARATE_WORDS
            ));
            const results = collector.suggestions;
            const suggestions = results.map(s => s.word);
            expect(suggestions).to.contain('one two three four');
            expect(suggestions[0]).to.be.equal('one two three four');
            expect(suggestions).to.be.length(collector.maxNumSuggestions);
        });
    });

    it('Tests compound JOIN_WORDS suggestions', function() {
        this.timeout(timeout);
        return getTrie().then(trie => {
            // cspell:ignore onetwothrefour
            const collector = suggestionCollector('onetwothreefour', 8, undefined, 3);
            collector.collect(genCompoundableSuggestions(
                trie.root,
                collector.word,
                CompoundWordsMethod.JOIN_WORDS
            ));
            const results = collector.suggestions;
            const suggestions = results.map(s => s.word);
            expect(suggestions).to.contain('one+two+three+four');
            expect(suggestions).to.be.length(collector.maxNumSuggestions);
        });
    });

    it('Tests compound suggestions', function() {
        this.timeout(timeout);
        return getTrie().then(trie => {
            // cspell:ignore onetwothrefour
            const collector = suggestionCollector('onetwothreefour', 8, undefined, 3);
            collector.collect(genCompoundableSuggestions(
                trie.root,
                collector.word,
                CompoundWordsMethod.JOIN_WORDS
            ));
            const results = collector.suggestions;
            const suggestions = results.map(s => s.word);
            expect(suggestions).to.contain('one+two+three+four');
            expect(suggestions).to.be.length(collector.maxNumSuggestions);
        });
    });

    // Takes a long time.
    it('Tests long compound suggestions', function() {
        this.timeout(timeout * 2);
        return getTrie().then(trie => {
            // cspell:ignore testscompundsuggestions
            const collector = suggestionCollector('testscompundsuggestions', 1, undefined, 3);
            collector.collect(genCompoundableSuggestions(
                trie.root,
                collector.word,
                CompoundWordsMethod.SEPARATE_WORDS
            ));
            const results = collector.suggestions;
            const suggestions = results.map(s => s.word);
            // console.log('Results:');
            // console.log(results.map((r, i) => `${i} ${r.cost} ${r.word}`).join('\n'));
            expect(suggestions).to.be.length(collector.maxNumSuggestions);
            expect(suggestions).to.contain('tests compound suggestions');
            expect(suggestions[0]).to.be.equal('tests compound suggestions');
        });
    });
});

