"use strict";
const Text = require("./util/text");
const CSpellSettingsServer_1 = require("./CSpellSettingsServer");
const SpellingDictionary_1 = require("./SpellingDictionary");
const regExMatchRegEx = /\/.*\/[gimuy]*/;
const regExInFileSetting = /(?:spell-?checker|cSpell)::?\s*(.*)/gi;
function getInDocumentSettings(text) {
    const settings = getPossibleInDocSettings(text)
        .map(a => a[1] || '')
        .concatMap(a => parseSettingMatch(a))
        .reduce((s, setting) => {
        return CSpellSettingsServer_1.mergeInDocSettings(s, setting);
    }, {});
    return settings;
}
exports.getInDocumentSettings = getInDocumentSettings;
function parseSettingMatch(possibleSetting) {
    const settingParsers = [
        [/^(?:enable|disable)(?:allow)?CompoundWords/i, parseCompoundWords],
        [/^words?\s/i, parseWords],
        [/^ignore(?:words?)?\s/i, parseIgnoreWords],
        [/^ignore_?Reg_?Exp\s+.+$/i, parseIgnoreRegExp],
        [/^include_?Reg_?Exp\s+.+$/i, parseIncludeRegExp],
    ];
    return settingParsers
        .filter(([regex]) => regex.test(possibleSetting))
        .map(([, fn]) => fn)
        .map(fn => fn(possibleSetting));
}
function parseCompoundWords(match) {
    const allowCompoundWords = (/enable/i).test(match);
    return { allowCompoundWords };
}
function parseWords(match) {
    const words = match.split(/[,\s]+/g).slice(1);
    return { words };
}
function parseIgnoreWords(match) {
    const wordsSetting = parseWords(match);
    return { ignoreWords: wordsSetting.words };
}
function parseRegEx(match) {
    const patterns = [match.replace(/^[^\s]+\s+/, '')]
        .map(a => {
        const m = a.match(regExMatchRegEx);
        if (m && m[0]) {
            return m[0];
        }
        return a.replace(/((?:[^\s]|\\ )+).*/, '$1');
    });
    return patterns;
}
function parseIgnoreRegExp(match) {
    const ignoreRegExpList = parseRegEx(match);
    return { ignoreRegExpList };
}
function parseIncludeRegExp(match) {
    const includeRegExpList = parseRegEx(match);
    return { includeRegExpList };
}
function getPossibleInDocSettings(text) {
    return Text.match(regExInFileSetting, text);
}
function getWordsDictionaryFromDoc(text) {
    return SpellingDictionary_1.createSpellingDictionary(getWordsFromDocument(text));
}
exports.getWordsDictionaryFromDoc = getWordsDictionaryFromDoc;
function getWordsFromDocument(text) {
    const { words = [] } = getInDocumentSettings(text);
    return words;
}
function getIgnoreWordsFromDocument(text) {
    const { ignoreWords = [] } = getInDocumentSettings(text);
    return ignoreWords;
}
exports.getIgnoreWordsFromDocument = getIgnoreWordsFromDocument;
function getIgnoreWordsSetFromDocument(text) {
    return new Set(getIgnoreWordsFromDocument(text).map(a => a.toLowerCase()));
}
exports.getIgnoreWordsSetFromDocument = getIgnoreWordsSetFromDocument;
function getIgnoreRegExpFromDocument(text) {
    const { ignoreRegExpList = [] } = getInDocumentSettings(text);
    return ignoreRegExpList;
}
exports.getIgnoreRegExpFromDocument = getIgnoreRegExpFromDocument;
/**
 * These internal functions are used exposed for unit testing.
 */
exports.internal = {
    getPossibleInDocSettings,
    getWordsFromDocument,
    parseWords,
    parseCompoundWords,
    parseIgnoreRegExp,
    parseIgnoreWords,
};
//# sourceMappingURL=InDocSettings.js.map