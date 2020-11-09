/* eslint-disable jest/valid-expect */
import { expect } from 'chai';
import { genCompoundableSuggestions, CompoundWordsMethod, suggestionCollector } from './suggest';
import { readTrie } from './dictionaries.test.helper';

function getTrie() {
    return readTrie('cspell-dict-en_us');
}

const timeout = 10000;

describe('Validate English Suggestions', () => {
    test('Tests suggestions', async () => {
        jest.setTimeout(timeout);
        const trie = await getTrie();
        const collector = suggestionCollector('joyful', 8, undefined, 1);
        collector.collect(genCompoundableSuggestions(trie.root, collector.word, CompoundWordsMethod.NONE));
        const results = collector.suggestions;
        const suggestions = results.map((s) => s.word);
        expect(suggestions).to.contain('joyful');
        expect(suggestions[0]).to.be.equal('joyful');
    });

    test('Tests suggestions 2', async () => {
        jest.setTimeout(timeout);
        const trie = await getTrie();
        // cspell:ignore joyfull
        const collector = suggestionCollector('joyfull', 8);
        collector.collect(genCompoundableSuggestions(trie.root, collector.word, CompoundWordsMethod.SEPARATE_WORDS));
        const results = collector.suggestions;
        const suggestions = results.map((s) => s.word);
        expect(suggestions).to.contain('joyful');
        expect(suggestions[0]).to.be.equal('joyfully');
        expect(suggestions[1]).to.be.equal('joyful');
        expect(suggestions).to.be.length(collector.maxNumSuggestions);
    });

    test('Tests compound SEPARATE_WORDS suggestions', async () => {
        jest.setTimeout(timeout);
        const trie = await getTrie();
        // cspell:ignore onetwothreefour
        const collector = suggestionCollector('onetwothreefour', 8, undefined, 3.3);
        collector.collect(genCompoundableSuggestions(trie.root, collector.word, CompoundWordsMethod.SEPARATE_WORDS));
        const results = collector.suggestions;
        const suggestions = results.map((s) => s.word);
        expect(suggestions).to.contain('one two three four');
        expect(suggestions[0]).to.be.equal('one two three four');
        expect(suggestions).to.be.length(collector.maxNumSuggestions);
    });

    test('Tests compound JOIN_WORDS suggestions', async () => {
        jest.setTimeout(timeout);
        const trie = await getTrie();
        // cspell:ignore onetwothrefour
        const collector = suggestionCollector('onetwothreefour', 8, undefined, 3);
        collector.collect(genCompoundableSuggestions(trie.root, collector.word, CompoundWordsMethod.JOIN_WORDS));
        const results = collector.suggestions;
        const suggestions = results.map((s) => s.word);
        expect(suggestions).to.contain('one+two+three+four');
        expect(suggestions).to.be.length(collector.maxNumSuggestions);
    });

    test('Tests compound suggestions', async () => {
        jest.setTimeout(timeout);
        const trie = await getTrie();
        // cspell:ignore onetwothrefour
        const collector = suggestionCollector('onetwothreefour', 8, undefined, 3);
        collector.collect(genCompoundableSuggestions(trie.root, collector.word, CompoundWordsMethod.JOIN_WORDS));
        const results = collector.suggestions;
        const suggestions = results.map((s) => s.word);
        expect(suggestions).to.contain('one+two+three+four');
        expect(suggestions).to.be.length(collector.maxNumSuggestions);
    });

    // Takes a long time.
    test('Tests long compound suggestions', async () => {
        jest.setTimeout(timeout);
        const trie = await getTrie();
        // cspell:ignore testscompundsuggestions
        const collector = suggestionCollector('testscompundsuggestions', 1, undefined, 3);
        collector.collect(genCompoundableSuggestions(trie.root, collector.word, CompoundWordsMethod.SEPARATE_WORDS));
        const results = collector.suggestions;
        const suggestions = results.map((s) => s.word);
        // console.log('Results:');
        // console.log(results.map((r, i) => `${i} ${r.cost} ${r.word}`).join('\n'));
        expect(suggestions).to.be.length(collector.maxNumSuggestions);
        expect(suggestions).to.contain('tests compound suggestions');
        expect(suggestions[0]).to.be.equal('tests compound suggestions');
    });
});
