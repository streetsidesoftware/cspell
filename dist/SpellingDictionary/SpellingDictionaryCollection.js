"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
const SpellingDictionary_1 = require("./SpellingDictionary");
const gensequence_1 = require("gensequence");
class SpellingDictionaryCollection {
    constructor(dictionaries) {
        this.dictionaries = dictionaries;
        this.dictionaries = this.dictionaries.filter(a => !!a.size);
    }
    has(word) {
        return isWordInAnyDictionary(this.dictionaries, word);
    }
    suggest(word, numSuggestions) {
        return makeSuggestions(this.dictionaries, word, numSuggestions);
    }
    get size() {
        return this.dictionaries.reduce((a, b) => a + b.size, 0);
    }
}
exports.SpellingDictionaryCollection = SpellingDictionaryCollection;
function createCollection(dictionaries) {
    return new SpellingDictionaryCollection(dictionaries);
}
exports.createCollection = createCollection;
function isWordInAnyDictionary(dicts, word) {
    return !!gensequence_1.genSequence(dicts)
        .first(dict => dict.has(word));
}
exports.isWordInAnyDictionary = isWordInAnyDictionary;
function makeSuggestions(dicts, word, numSuggestions) {
    // Make a map of the unique suggestions.  If there are duplicates, keep the lowest cost.
    const allSuggestions = gensequence_1.genSequence(dicts)
        .concatMap(dict => dict.suggest(word, numSuggestions))
        .reduceToSequence((map, sug) => {
        const cost = Math.min(sug.cost, (map.get(sug.word) || sug).cost);
        map.set(sug.word, __assign({}, sug, { cost }));
        return map;
    }, new Map())
        .map(([, v]) => v)
        .toArray()
        .sort((a, b) => a.cost - b.cost);
    return allSuggestions.slice(0, numSuggestions);
}
exports.makeSuggestions = makeSuggestions;
function createCollectionRx(wordLists) {
    const dictionaries = wordLists.map(words => SpellingDictionary_1.createSpellingDictionaryRx(words));
    return createCollectionP(dictionaries);
}
exports.createCollectionRx = createCollectionRx;
function createCollectionP(dicts) {
    return Promise.all(dicts)
        .then(dicts => new SpellingDictionaryCollection(dicts));
}
exports.createCollectionP = createCollectionP;
//# sourceMappingURL=SpellingDictionaryCollection.js.map