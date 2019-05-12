"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const wordListHelper_1 = require("../wordListHelper");
const SpellingDictionary_1 = require("./SpellingDictionary");
const path = require("path");
const operators_1 = require("rxjs/operators");
const loaders = {
    S: loadSimpleWordList,
    W: loadWordList,
    C: loadCodeWordList,
    T: loadTrie,
    default: loadSimpleWordList,
};
const dictionaryCache = new Map();
function loadDictionary(uri, options) {
    const loaderType = determineType(uri, options);
    const key = [uri, loaderType].join('|');
    if (!dictionaryCache.has(key)) {
        dictionaryCache.set(key, load(uri, options));
    }
    return dictionaryCache.get(key);
}
exports.loadDictionary = loadDictionary;
function determineType(uri, options) {
    const defType = uri.endsWith('.trie.gz') ? 'T' : uri.endsWith('.txt.gz') ? 'S' : 'C';
    const { type = defType } = options;
    const regTrieTest = /\.trie\b/i;
    return regTrieTest.test(uri) ? 'T' : type;
}
function load(uri, options) {
    const type = determineType(uri, options);
    const loader = loaders[type] || loaders.default;
    return loader(uri, options);
}
function loadSimpleWordList(filename, options) {
    return SpellingDictionary_1.createSpellingDictionaryRx(wordListHelper_1.loadWordsRx(filename), path.basename(filename), filename, options);
}
function loadWordList(filename, options) {
    return SpellingDictionary_1.createSpellingDictionaryRx(wordListHelper_1.loadWordsRx(filename).pipe(operators_1.flatMap(wordListHelper_1.splitLineIntoWordsRx)), path.basename(filename), filename, options);
}
function loadCodeWordList(filename, options) {
    return SpellingDictionary_1.createSpellingDictionaryRx(wordListHelper_1.loadWordsRx(filename).pipe(operators_1.flatMap(wordListHelper_1.splitLineIntoWordsRx)), path.basename(filename), filename, options);
}
function loadTrie(filename, options) {
    return SpellingDictionary_1.createSpellingDictionaryTrie(wordListHelper_1.loadWordsRx(filename), path.basename(filename), filename, options);
}
//# sourceMappingURL=DictionaryLoader.js.map