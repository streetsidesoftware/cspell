"use strict";
const SpellSettings = require("./CSpellSettingsServer");
const defaultLocal = 'en';
exports.defaultLanguageSettings = [
    { languageId: '*', local: 'en', dictionaries: ['wordsEn'], },
    { languageId: '*', local: 'en-US', dictionaries: ['wordsEn'], },
    { languageId: '*', local: 'en-GB', dictionaries: ['wordsEnGb'], },
    { languageId: '*', dictionaries: ['companies', 'softwareTerms', 'misc'], },
    { languageId: 'python', allowCompoundWords: true, dictionaries: ['python'] },
    { languageId: 'go', allowCompoundWords: true, dictionaries: ['go'], },
    { languageId: 'c', allowCompoundWords: true, dictionaries: ['cpp'], },
    { languageId: 'cpp', allowCompoundWords: true, dictionaries: ['cpp'], },
    { languageId: 'csharp', allowCompoundWords: true, dictionaries: ['csharp', 'dotnet', 'npm'] },
    { languageId: 'javascript', dictionaries: ['typescript', 'node', 'npm'] },
    { languageId: 'javascriptreact', dictionaries: ['typescript', 'node', 'npm'] },
    { languageId: 'typescript', dictionaries: ['typescript', 'node', 'npm'] },
    { languageId: 'typescriptreact', dictionaries: ['typescript', 'node', 'npm'] },
    { languageId: 'html', dictionaries: ['html', 'fonts', 'typescript', 'css', 'npm'] },
    { languageId: 'jade', dictionaries: ['html', 'fonts', 'typescript', 'css', 'npm'] },
    { languageId: 'pug', dictionaries: ['html', 'fonts', 'typescript', 'css', 'npm'] },
    { languageId: 'php', dictionaries: ['php', 'html', 'fonts', 'css', 'typescript', 'npm'] },
    { languageId: 'css', dictionaries: ['fonts', 'css'] },
    { languageId: 'less', dictionaries: ['fonts', 'css'] },
    { languageId: 'scss', dictionaries: ['fonts', 'css'] },
];
function getDefaultLanguageSettings() {
    return { languageSettings: exports.defaultLanguageSettings };
}
exports.getDefaultLanguageSettings = getDefaultLanguageSettings;
function NormalizeLocal(local) {
    return local.toLowerCase().replace(/[^a-z]/g, '');
}
function calcSettingsForLanguage(languageSettings, languageId, local) {
    local = NormalizeLocal(local);
    return exports.defaultLanguageSettings.concat(languageSettings)
        .filter(s => s.languageId === '*' || s.languageId === languageId)
        .filter(s => !s.local || NormalizeLocal(s.local) === local || s.local === '*')
        .reduce((langSetting, setting) => {
        const { allowCompoundWords = langSetting.allowCompoundWords } = setting;
        const dictionaries = mergeUnique(langSetting.dictionaries, setting.dictionaries);
        return { languageId, local, allowCompoundWords, dictionaries };
    });
}
exports.calcSettingsForLanguage = calcSettingsForLanguage;
function calcUserSettingsForLanguage(settings, languageId) {
    const { languageSettings = [], language: local = defaultLocal } = settings;
    const { allowCompoundWords = settings.allowCompoundWords, dictionaries, dictionaryDefinitions } = calcSettingsForLanguage(languageSettings, languageId, local);
    return SpellSettings.mergeSettings(settings, { allowCompoundWords, dictionaries, dictionaryDefinitions });
}
exports.calcUserSettingsForLanguage = calcUserSettingsForLanguage;
function mergeUnique(a = [], b = []) {
    // Merge and Make unique
    return [...(new Set(a.concat(b)))];
}
//# sourceMappingURL=LanguageSettings.js.map