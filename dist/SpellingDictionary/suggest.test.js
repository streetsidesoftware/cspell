"use strict";
const chai_1 = require("chai");
const suggest_1 = require("./suggest");
const Trie_1 = require("./Trie");
const loggingOn = false;
const consoleLog = loggingOn ? console.log : () => { };
describe('test building tries', () => {
    it('build', () => {
        const words = [
            'apple', 'ape', 'able', 'apple', 'banana', 'orange', 'pear', 'aim', 'approach'
        ];
        const trie = Trie_1.wordListToTrie(words);
        chai_1.expect(trie).to.not.be.null;
    });
});
/* */
describe('test suggestions', () => {
    const words = [
        'apple', 'ape', 'able', 'apples', 'banana', 'orange', 'pear', 'aim', 'approach', 'bear'
    ];
    const trie = Trie_1.wordListToTrie(words);
    it('tests matches aple', () => {
        const results = suggest_1.suggest(trie, 'aple');
        const suggestions = results.map(({ word }) => word);
        chai_1.expect(results).to.not.be.null;
        chai_1.expect(suggestions).to.contain('apple');
        chai_1.expect(suggestions).to.contain('ape');
        chai_1.expect(suggestions).to.not.contain('banana');
    });
    it('tests matches approch', () => {
        const results = suggest_1.suggest(trie, 'approch');
        const suggestions = results.map(({ word }) => word);
        chai_1.expect(suggestions).to.not.contain('apple');
        chai_1.expect(suggestions).to.contain('approach');
        chai_1.expect(suggestions).to.not.contain('banana');
    });
    it('tests matches ear', () => {
        const results = suggest_1.suggest(trie, 'ear');
        const suggestions = results.map(({ word }) => word);
        chai_1.expect(suggestions).to.not.contain('apple');
        chai_1.expect(suggestions).to.contain('pear');
        chai_1.expect(suggestions).to.contain('bear');
    });
});
describe('matching hte', () => {
    const words = [
        'ate', 'hoe', 'hot', 'the', 'how', 'toe'
    ];
    const trie = Trie_1.wordListToTrie(words);
    it('checks best match', () => {
        const results = suggest_1.suggest(trie, 'hte');
        consoleLog(JSON.stringify(results, null, 4));
    });
});
describe('test for duplicate suggestions', () => {
    const words = [
        'apple', 'ape', 'able', 'apples', 'banana', 'orange', 'pear', 'aim', 'approach', 'bear'
    ];
    it('tests ', () => {
        const word = 'beaet';
        const expectWord = 'beeeet';
        const extraWords = [expectWord];
        const trie = Trie_1.wordListToTrie([...words, ...extraWords]);
        const results = suggest_1.suggest(trie, word);
        const suggestions = results.map(({ word }) => word);
        consoleLog(suggestions);
        chai_1.expect(results).to.not.be.null;
        chai_1.expect(suggestions).to.contain(expectWord);
    });
});
//# sourceMappingURL=suggest.test.js.map