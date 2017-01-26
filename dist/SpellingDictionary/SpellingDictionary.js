"use strict";
const suggest_1 = require("./suggest");
const Trie_1 = require("./Trie");
const gensequence_1 = require("gensequence");
class SpellingDictionaryInstance {
    constructor(words, trie) {
        this.words = words;
        this.trie = trie;
    }
    has(word) {
        return this.words.has(word.toLowerCase());
    }
    suggest(word, numSuggestions) {
        return suggest_1.suggest(this.trie, word.toLowerCase(), numSuggestions);
    }
    get size() {
        return this.words.size;
    }
}
exports.SpellingDictionaryInstance = SpellingDictionaryInstance;
function reduceWordsToTrieSet(ws, word) {
    // @todo: figure out dealing with case in source words
    word = word.toLowerCase().trim();
    const { words, trie } = ws;
    if (!words.has(word)) {
        words.add(word);
        Trie_1.addWordToTrie(trie, word);
    }
    return { words, trie };
}
function createSpellingDictionary(wordList) {
    const { words, trie } = gensequence_1.genSequence(wordList)
        .reduce(reduceWordsToTrieSet, { words: new Set(), trie: Trie_1.createTrie() });
    return new SpellingDictionaryInstance(words, trie);
}
exports.createSpellingDictionary = createSpellingDictionary;
function createSpellingDictionaryRx(words) {
    const promise = words
        .reduce(reduceWordsToTrieSet, { words: new Set(), trie: Trie_1.createTrie() })
        .map(({ words, trie }) => new SpellingDictionaryInstance(words, trie))
        .toPromise();
    return Promise.all([promise]).then(a => a[0]);
}
exports.createSpellingDictionaryRx = createSpellingDictionaryRx;
//# sourceMappingURL=SpellingDictionary.js.map