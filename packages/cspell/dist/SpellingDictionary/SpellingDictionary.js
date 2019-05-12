"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gensequence_1 = require("gensequence");
const operators_1 = require("rxjs/operators");
const cspell_trie_1 = require("cspell-trie");
const repMap_1 = require("../util/repMap");
var cspell_trie_2 = require("cspell-trie");
exports.CompoundWordsMethod = cspell_trie_2.CompoundWordsMethod;
exports.JOIN_SEPARATOR = cspell_trie_2.JOIN_SEPARATOR;
exports.suggestionCollector = cspell_trie_2.suggestionCollector;
exports.WORD_SEPARATOR = cspell_trie_2.WORD_SEPARATOR;
const defaultSuggestions = 10;
class SpellingDictionaryFromSet {
    constructor(words, name, options = {}, source = 'Set of words') {
        this.words = words;
        this.name = name;
        this.options = options;
        this.source = source;
        this.type = 'SpellingDictionaryFromSet';
        this.mapWord = repMap_1.createMapper(options.repMap || []);
    }
    get trie() {
        this._trie = this._trie || cspell_trie_1.Trie.create(this.words);
        return this._trie;
    }
    has(word, useCompounds) {
        useCompounds = useCompounds === undefined ? this.options.useCompounds : useCompounds;
        useCompounds = useCompounds || false;
        const mWord = this.mapWord(word).toLowerCase();
        return this.words.has(mWord)
            || (useCompounds && this.trie.has(mWord, true))
            || false;
    }
    suggest(word, numSuggestions, compoundMethod = cspell_trie_1.CompoundWordsMethod.SEPARATE_WORDS, numChanges) {
        word = this.mapWord(word).toLowerCase();
        return this.trie.suggestWithCost(word, numSuggestions || defaultSuggestions, compoundMethod, numChanges);
    }
    genSuggestions(collector, compoundMethod = cspell_trie_1.CompoundWordsMethod.SEPARATE_WORDS) {
        this.trie.genSuggestions(collector, compoundMethod);
    }
    get size() {
        return this.words.size;
    }
}
exports.SpellingDictionaryFromSet = SpellingDictionaryFromSet;
function createSpellingDictionary(wordList, name, source, options) {
    const words = new Set(gensequence_1.genSequence(wordList)
        .filter(word => typeof word === 'string')
        .map(word => word.toLowerCase().trim())
        .filter(word => !!word));
    return new SpellingDictionaryFromSet(words, name, options, source);
}
exports.createSpellingDictionary = createSpellingDictionary;
function createSpellingDictionaryRx(words, name, source, options) {
    const promise = words.pipe(operators_1.filter(word => typeof word === 'string'), operators_1.map(word => word.toLowerCase().trim()), operators_1.filter(word => !!word), operators_1.reduce((words, word) => words.add(word), new Set()), operators_1.map(words => new SpellingDictionaryFromSet(words, name, options, source))).toPromise();
    return promise;
}
exports.createSpellingDictionaryRx = createSpellingDictionaryRx;
class SpellingDictionaryFromTrie {
    constructor(trie, name, options = {}, source = 'from trie') {
        this.trie = trie;
        this.name = name;
        this.options = options;
        this.source = source;
        this._size = 0;
        this.knownWords = new Set();
        this.unknownWords = new Set();
        this.type = 'SpellingDictionaryFromTrie';
        trie.root.f = 0;
        this.mapWord = repMap_1.createMapper(options.repMap || []);
    }
    get size() {
        if (!this._size) {
            // walk the trie and get the approximate size.
            const i = this.trie.iterate();
            let deeper = true;
            for (let r = i.next(); !r.done; r = i.next(deeper)) {
                // count all nodes even though they are not words.
                // because we are not going to all the leaves, this should give a good enough approximation.
                this._size += 1;
                deeper = r.value.text.length < 5;
            }
        }
        return this._size;
    }
    has(word, useCompounds) {
        useCompounds = useCompounds === undefined ? this.options.useCompounds : useCompounds;
        useCompounds = useCompounds || false;
        word = this.mapWord(word).toLowerCase();
        const wordX = word + '|' + useCompounds;
        if (this.knownWords.has(wordX))
            return true;
        if (this.unknownWords.has(wordX))
            return false;
        const r = this.trie.has(word, useCompounds);
        // Cache the result.
        if (r) {
            this.knownWords.add(wordX);
        }
        else {
            // clear the unknown word list if it has grown too large.
            if (this.unknownWords.size > SpellingDictionaryFromTrie.unknownWordsLimit) {
                this.unknownWords.clear();
            }
            this.unknownWords.add(wordX);
        }
        return r;
    }
    suggest(word, numSuggestions, compoundMethod = cspell_trie_1.CompoundWordsMethod.SEPARATE_WORDS, numChanges) {
        word = this.mapWord(word).toLowerCase();
        compoundMethod = this.options.useCompounds ? cspell_trie_1.CompoundWordsMethod.JOIN_WORDS : compoundMethod;
        return this.trie.suggestWithCost(word, numSuggestions || defaultSuggestions, compoundMethod, numChanges);
    }
    genSuggestions(collector, compoundMethod = cspell_trie_1.CompoundWordsMethod.SEPARATE_WORDS) {
        compoundMethod = this.options.useCompounds ? cspell_trie_1.CompoundWordsMethod.JOIN_WORDS : compoundMethod;
        this.trie.genSuggestions(collector, compoundMethod);
    }
}
SpellingDictionaryFromTrie.unknownWordsLimit = 1000;
exports.SpellingDictionaryFromTrie = SpellingDictionaryFromTrie;
function createSpellingDictionaryTrie(data, name, source, options) {
    const promise = cspell_trie_1.importTrieRx(data).pipe(operators_1.map(node => new cspell_trie_1.Trie(node)), operators_1.map(trie => new SpellingDictionaryFromTrie(trie, name, options, source)), operators_1.take(1)).toPromise();
    return promise;
}
exports.createSpellingDictionaryTrie = createSpellingDictionaryTrie;
//# sourceMappingURL=SpellingDictionary.js.map