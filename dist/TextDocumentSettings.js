"use strict";
const LanguageSettings_1 = require("./LanguageSettings");
const CSpellSettings = require("./CSpellSettingsServer");
const InDocSettings_1 = require("./InDocSettings");
const SpellingDictionaryCollection_1 = require("./SpellingDictionaryCollection");
const SpellingDictionary_1 = require("./SpellingDictionary");
const Dictionaries_1 = require("./Dictionaries");
function getSettings(settings, text, languageId) {
    const langIds = ['*'].concat(languageId instanceof Array ? languageId : [languageId]);
    const langSettings = langIds.reduce((settings, languageId) => {
        return LanguageSettings_1.calcUserSettingsForLanguage(settings, languageId);
    }, settings);
    return CSpellSettings.finalizeSettings(CSpellSettings.mergeSettings(langSettings, InDocSettings_1.getInDocumentSettings(text)));
}
exports.getSettings = getSettings;
function getDictionary(settings) {
    const { words = [], userWords = [], dictionaries = [], dictionaryDefinitions = [] } = settings;
    const spellDictionaries = Dictionaries_1.loadDictionaries(dictionaries, dictionaryDefinitions);
    const settingsDictionary = Promise.resolve(SpellingDictionary_1.createSpellingDictionary(words.concat(userWords)));
    return SpellingDictionaryCollection_1.createCollectionP([...spellDictionaries, settingsDictionary]);
}
exports.getDictionary = getDictionary;
//# sourceMappingURL=TextDocumentSettings.js.map