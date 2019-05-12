"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SpellingDictionary_1 = require("./SpellingDictionary");
const gensequence_1 = require("gensequence");
class SpellingDictionaryCollection {
    constructor(dictionaries, name, wordsToFlag) {
        this.dictionaries = dictionaries;
        this.name = name;
        this.options = {};
        this.mapWord = (word) => word;
        this.type = 'SpellingDictionaryCollection';
        this.dictionaries = this.dictionaries.filter(a => !!a.size);
        this.wordsToFlag = new Set(wordsToFlag.map(w => w.toLowerCase()));
        this.source = dictionaries.map(d => d.name).join(', ');
    }
    has(word, useCompounds) {
        word = word.toLowerCase();
        return !this.wordsToFlag.has(word) && isWordInAnyDictionary(this.dictionaries, word, useCompounds);
    }
    suggest(word, numSuggestions, compoundMethod = SpellingDictionary_1.CompoundWordsMethod.SEPARATE_WORDS, numChanges) {
        word = word.toLowerCase();
        compoundMethod = this.options.useCompounds ? SpellingDictionary_1.CompoundWordsMethod.JOIN_WORDS : compoundMethod;
        const collector = this.genSuggestions(SpellingDictionary_1.suggestionCollector(word, numSuggestions, word => !this.wordsToFlag.has(word), numChanges), compoundMethod);
        return collector.suggestions;
    }
    get size() {
        return this.dictionaries.reduce((a, b) => a + b.size, 0);
    }
    genSuggestions(collector, compoundMethod = SpellingDictionary_1.CompoundWordsMethod.SEPARATE_WORDS) {
        compoundMethod = this.options.useCompounds ? SpellingDictionary_1.CompoundWordsMethod.JOIN_WORDS : compoundMethod;
        this.dictionaries.forEach(dict => dict.genSuggestions(collector, compoundMethod));
        return collector;
    }
}
exports.SpellingDictionaryCollection = SpellingDictionaryCollection;
function createCollection(dictionaries, name, wordsToFlag = []) {
    return new SpellingDictionaryCollection(dictionaries, name, wordsToFlag);
}
exports.createCollection = createCollection;
function isWordInAnyDictionary(dicts, word, useCompounds) {
    return !!gensequence_1.genSequence(dicts)
        .first(dict => dict.has(word, useCompounds));
}
exports.isWordInAnyDictionary = isWordInAnyDictionary;
function createCollectionP(dicts, name, wordsToFlag) {
    return Promise.all(dicts)
        .then(dicts => new SpellingDictionaryCollection(dicts, name, wordsToFlag));
}
exports.createCollectionP = createCollectionP;
//# sourceMappingURL=SpellingDictionaryCollection.js.map