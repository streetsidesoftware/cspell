"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
const DictionaryLoader_1 = require("./DictionaryLoader");
const path = require("path");
const dictionaryPath = () => path.join(__dirname, '..', 'dist', 'dictionaries');
function loadDictionaries(dictIds, defs) {
    const defsToLoad = filterDictDefsToLoad(dictIds, defs);
    return defsToLoad
        .map(e => e[1])
        .map(def => DictionaryLoader_1.loadDictionary(def.path, { type: def.type }));
}
exports.loadDictionaries = loadDictionaries;
function filterDictDefsToLoad(dictIds, defs) {
    const dictIdSet = new Set(dictIds);
    const activeDefs = defs
        .filter(({ name }) => dictIdSet.has(name))
        .map(def => (__assign({}, def, { path: getFullPathName(def) })))
        .filter(def => !!def.path)
        .map(def => [def.name, def]);
    return [...(new Map(activeDefs))];
}
exports.filterDictDefsToLoad = filterDictDefsToLoad;
function getFullPathName(def) {
    const { path: filePath = '', file = '' } = def;
    if (filePath + file === '') {
        return '';
    }
    const dictPath = path.join(filePath || dictionaryPath(), file);
    return dictPath;
}
function normalizePathForDictDefs(defs, defaultPath) {
    return defs
        .map(def => normalizePathForDictDef(def, defaultPath));
}
exports.normalizePathForDictDefs = normalizePathForDictDefs;
function normalizePathForDictDef(def, defaultPath) {
    const { path: relPath = '.' } = def;
    const absPath = relPath.match(/^\./) ? path.join(defaultPath, relPath) : relPath;
    return __assign({}, def, { path: absPath });
}
exports.normalizePathForDictDef = normalizePathForDictDef;
//# sourceMappingURL=Dictionaries.js.map