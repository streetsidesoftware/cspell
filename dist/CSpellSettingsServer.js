"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
const fs = require("fs");
const json = require("comment-json");
const path = require("path");
const Dictionaries_1 = require("./Dictionaries");
const currentSettingsFileVersion = '0.1';
exports.sectionCSpell = 'cSpell';
exports.defaultFileName = 'cSpell.json';
const defaultSettings = {
    version: currentSettingsFileVersion,
};
function readSettings(filename, defaultValues = defaultSettings) {
    const settings = readJsonFile(filename);
    const pathToSettings = path.dirname(filename);
    function readJsonFile(file) {
        try {
            return json.parse(fs.readFileSync(file).toString());
        }
        catch (err) {
        }
        return defaultValues;
    }
    // Fix up dictionaryDefinitions
    const dictionaryDefinitions = Dictionaries_1.normalizePathForDictDefs(settings.dictionaryDefinitions || [], pathToSettings);
    const languageSettings = (settings.languageSettings || [])
        .map(langSetting => (__assign({}, langSetting, { dictionaryDefinitions: Dictionaries_1.normalizePathForDictDefs(langSetting.dictionaryDefinitions || [], pathToSettings) })));
    return __assign({}, defaultValues, settings, { dictionaryDefinitions, languageSettings });
}
exports.readSettings = readSettings;
function readSettingsFiles(filenames) {
    return filenames.map(filename => readSettings(filename)).reduce((a, b) => mergeSettings(a, b), defaultSettings);
}
exports.readSettingsFiles = readSettingsFiles;
/**
 * Merges two lists of strings and removes duplicates.  Order is NOT preserved.
 */
function mergeList(left = [], right = []) {
    const setOfWords = new Set([...left, ...right]);
    return [...setOfWords.keys()];
}
function replaceIfNotEmpty(left = [], right = []) {
    const filtered = right.filter(a => !!a);
    if (filtered.length) {
        return filtered;
    }
    return left;
}
function mergeSettings(left, ...settings) {
    return settings.reduce((left, right) => (__assign({}, left, right, { words: mergeList(left.words, right.words), userWords: mergeList(left.userWords, right.userWords), flagWords: mergeList(left.flagWords, right.flagWords), ignoreWords: mergeList(left.ignoreWords, right.ignoreWords), enabledLanguageIds: replaceIfNotEmpty(left.enabledLanguageIds, right.enabledLanguageIds), ignoreRegExpList: mergeList(left.ignoreRegExpList, right.ignoreRegExpList), patterns: mergeList(left.patterns, right.patterns), dictionaryDefinitions: mergeList(left.dictionaryDefinitions, right.dictionaryDefinitions), dictionaries: mergeList(left.dictionaries, right.dictionaries), languageSettings: mergeList(left.languageSettings, right.languageSettings) })), left);
}
exports.mergeSettings = mergeSettings;
function mergeInDocSettings(left, right) {
    const merged = __assign({}, mergeSettings(left, right), { includeRegExpList: mergeList(left.includeRegExpList, right.includeRegExpList) });
    return merged;
}
exports.mergeInDocSettings = mergeInDocSettings;
function finalizeSettings(settings) {
    // apply patterns to any RegExpLists.
    return __assign({}, settings, { ignoreRegExpList: applyPatterns(settings.ignoreRegExpList, settings.patterns), includeRegExpList: applyPatterns(settings.includeRegExpList, settings.patterns) });
}
exports.finalizeSettings = finalizeSettings;
function applyPatterns(regExpList = [], patterns = []) {
    const patternMap = new Map(patterns
        .map(def => [def.name.toLowerCase(), def.pattern]));
    return regExpList.map(p => patternMap.get(p.toString().toLowerCase()) || p);
}
//# sourceMappingURL=CSpellSettingsServer.js.map