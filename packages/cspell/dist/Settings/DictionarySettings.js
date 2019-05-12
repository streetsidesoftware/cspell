"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const dictionaryPath = () => path.join(__dirname, '..', '..', 'dist', 'dictionaries');
function filterDictDefsToLoad(dictIds, defs) {
    // Process the dictIds in order, if it starts with a '!', remove it from the set.
    const dictIdSet = dictIds
        .map(id => id.trim())
        .filter(id => !!id)
        .reduce((dictSet, id) => {
        if (id[0] === '!') {
            dictSet.delete(id.slice(1));
        }
        else {
            dictSet.add(id);
        }
        return dictSet;
    }, new Set());
    const activeDefs = defs
        .filter(({ name }) => dictIdSet.has(name))
        .map(def => (Object.assign({}, def, { path: getFullPathName(def) })))
        // Remove any empty paths.
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
    return path.resolve(dictPath);
}
function normalizePathForDictDefs(defs, defaultPath) {
    return defs
        .map(def => normalizePathForDictDef(def, defaultPath));
}
exports.normalizePathForDictDefs = normalizePathForDictDefs;
function normalizePathForDictDef(def, defaultPath) {
    const { path: relPath = '.' } = def;
    const absPath = relPath.match(/^\./) ? path.join(defaultPath, relPath) : relPath;
    return Object.assign({}, def, { path: absPath });
}
exports.normalizePathForDictDef = normalizePathForDictDef;
//# sourceMappingURL=DictionarySettings.js.map