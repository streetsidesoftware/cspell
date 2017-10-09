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

describe('Validate English Suggestions', function() {
    this.timeout(30000);

    it('Tests suggestions', () => {
        return getTrie().then(trie => {
            const collector = suggestionCollector('joyful', 8);
            collector.collect(genCompoundableSuggestions(
                trie.root,
                collector.word,
                CompoundWordsMethod.NONE
            ));
            const results = collector.suggestions;
            const suggestions = results.map(s => s.word);
            expect(suggestions).to.contain('joyful');
            expect(suggestions[0]).to.be.equal('joyful');
            expect(suggestions).to.be.length(collector.maxNumSuggestions);
        });
    });

    it('Tests suggestions', () => {
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

    it('Tests compound SEPARATE_WORDS suggestions', () => {
        return getTrie().then(trie => {
            // cspell:ignore onetwothreefour
            const collector = suggestionCollector('onetwothreefour', 8);
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

    it('Tests compound JOIN_WORDS suggestions', () => {
        return getTrie().then(trie => {
            // cspell:ignore onetwothrefour
            const collector = suggestionCollector('onetwothreefour', 8);
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

    it('Tests compound suggestions', () => {
        return getTrie().then(trie => {
            // cspell:ignore onetwothrefour
            const collector = suggestionCollector('onetwothreefour', 8);
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
    it('Tests long compound suggestions', () => {
        return getTrie().then(trie => {
            // cspell:ignore testslongcompundsuggestions
            const collector = suggestionCollector('testslongcompundsuggestions', 1);
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
            expect(suggestions).to.contain('tests long compound suggestions');
            expect(suggestions[0]).to.be.equal('tests long compound suggestions');
        });
    });
});

