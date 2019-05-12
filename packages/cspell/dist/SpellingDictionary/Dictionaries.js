"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DictionarySettings_1 = require("../Settings/DictionarySettings");
const DictionaryLoader_1 = require("./DictionaryLoader");
const SpellingDictionary_1 = require("./SpellingDictionary");
const SpellingDictionaryCollection_1 = require("./SpellingDictionaryCollection");
function loadDictionaries(dictIds, defs) {
    const defsToLoad = DictionarySettings_1.filterDictDefsToLoad(dictIds, defs);
    return defsToLoad
        .map(e => e[1])
        .map(def => DictionaryLoader_1.loadDictionary(def.path, def));
}
exports.loadDictionaries = loadDictionaries;
function getDictionary(settings) {
    const { words = [], userWords = [], dictionaries = [], dictionaryDefinitions = [], flagWords = [] } = settings;
    const spellDictionaries = loadDictionaries(dictionaries, dictionaryDefinitions);
    const settingsDictionary = Promise.resolve(SpellingDictionary_1.createSpellingDictionary(words.concat(userWords), 'user_words', 'From Settings'));
    return SpellingDictionaryCollection_1.createCollectionP([...spellDictionaries, settingsDictionary], 'dictionary collection', flagWords);
}
exports.getDictionary = getDictionary;
//# sourceMappingURL=Dictionaries.js.map