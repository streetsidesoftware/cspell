"use strict";
const wordListHelper_1 = require("./wordListHelper");
const SpellingDictionary_1 = require("./SpellingDictionary");
const loaders = {
    S: loadSimpleWordList,
    W: loadWordList,
    C: loadCodeWordList,
};
const dictionaryCache = new Map();
function loadDictionary(uri, options) {
    const { type = 'C' } = options;
    const key = [uri, type].join('|');
    if (!dictionaryCache.has(key)) {
        const loader = loaders[type];
        dictionaryCache.set(key, SpellingDictionary_1.createSpellingDictionaryRx(loader(uri)));
    }
    return dictionaryCache.get(key);
}
exports.loadDictionary = loadDictionary;
function loadSimpleWordList(filename) {
    return wordListHelper_1.loadWordsRx(filename);
}
function loadWordList(filename) {
    return wordListHelper_1.loadWordsRx(filename).flatMap(wordListHelper_1.splitLineIntoWordsRx);
}
function loadCodeWordList(filename) {
    return wordListHelper_1.loadWordsRx(filename).flatMap(wordListHelper_1.splitLineIntoCodeWordsRx);
}
//# sourceMappingURL=DictionaryLoader.js.map