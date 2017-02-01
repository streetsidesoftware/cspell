import { expect } from 'chai';
import { suggest as suggestPrime, suggestAlt, SuggestionResult } from './suggest';
import { wordListToTrie } from './Trie';
import * as Trie from './Trie';

const loggingOn = false;

const consoleLog = loggingOn ? console.log : () => {};
const defaultNumberOfSuggestions = 5;

function suggest(trie: Trie.Trie, word: string, numSuggestions: number = defaultNumberOfSuggestions): SuggestionResult[] {
    const sugAlt = suggestAlt(trie, word, numSuggestions);
    const sugPrime = suggestPrime(trie, word, numSuggestions);
    expect(sugAlt).to.be.deep.equal(sugPrime);
    return sugPrime;
}

describe('test building tries', () => {
    it('build', () => {
        const words = [
            'apple', 'ape', 'able', 'apple', 'banana', 'orange', 'pear', 'aim', 'approach'
        ];
        const trie = wordListToTrie(words);
        expect(trie).to.not.be.null;
    });
});

/* */

describe('test suggestions', () => {
    const words = [
        'apple', 'ape', 'able', 'apples', 'banana', 'orange', 'pear', 'aim', 'approach', 'bear'
    ];

    const trie = wordListToTrie(words);

    // cSpell:ignore aple
    it('tests matches aple', () => {
        const results = suggest(trie, 'aple');
        const suggestions = results.map(({word}) => word);
        expect(results).to.not.be.null;
        expect(suggestions).to.contain('apple');
        expect(suggestions).to.contain('ape');
        expect(suggestions).to.not.contain('banana');
    });

    // cSpell:ignore approch
    it('tests matches approch', () => {
        const results = suggest(trie, 'approch');
        const suggestions = results.map(({word}) => word);
        expect(suggestions).to.not.contain('apple');
        expect(suggestions).to.contain('approach');
        expect(suggestions).to.not.contain('banana');
    });


    it('tests matches ear', () => {
        const results = suggest(trie, 'ear');
        const suggestions = results.map(({word}) => word);
        expect(suggestions).to.not.contain('apple');
        expect(suggestions).to.contain('pear');
        expect(suggestions).to.contain('bear');
    });
});

// cspell:ignore hte
describe('matching hte', () => {
    const words = [
        'ate', 'hoe', 'hot', 'the', 'how', 'toe'
    ];

    const trie = wordListToTrie(words);

    it('checks best match', () => {
        const results = suggest(trie, 'hte');
        consoleLog(JSON.stringify(results, null, 4));
    });
});

describe('test for duplicate suggestions', () => {
    const words = [
        'apple', 'ape', 'able', 'apples', 'banana', 'orange', 'pear', 'aim', 'approach', 'bear'
    ];

    // cSpell:ignore beaet beeeet
    it('tests ', () => {
        const word = 'beaet';
        const expectWord = 'beeeet';
        const extraWords = [ expectWord ];
        const trie = wordListToTrie([...words, ...extraWords]);
        const results = suggest(trie, word);
        const suggestions = results.map(({word}) => word);
        consoleLog(suggestions);
        expect(results).to.not.be.null;
        expect(suggestions).to.contain(expectWord);
    });
});

// cspell:ignore applauda
describe('Validate that suggestion reduction', () => {
    it('tests the case where there are more suggestions that wanted', () => {
        const trie = wordListToTrie(wordsApp);
        const results = suggest(trie, 'applauda');
        const suggestions = results.map(({word}) => word);
        consoleLog(suggestions);
        expect(suggestions).to.contain('applaud');
    });
});


const wordsApp = [
    'applaud',
    'applaudable',
    'applaudably',
    'applauded',
    'applauder',
    "applauder's",
    'applauders',
    'applauding',
    'applauds',
    'applause',
    "applause's",
    'applauses',
    'apple',
    "apple's",
    'applejack',
    "applejack's",
    'apples',
    'applesauce',
    "applesauce's",
    'appleseed',
    "appleseed's",
    'applet',
    "applet's",
    'appleton',
    "appleton's",
    'applets',
];
