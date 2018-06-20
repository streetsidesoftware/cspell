import { DictionaryDefinition, DictionaryId } from './CSpellSettingsDef';
import * as path from 'path';

const dictionaryPath = () => path.join(__dirname, '..', '..', 'dist', 'dictionaries');

export type DefMapArrayItem = [string, DictionaryDefinition];

export function filterDictDefsToLoad(dictIds: DictionaryId[], defs: DictionaryDefinition[]): DefMapArrayItem[]  {
    // Process the dictIds in order, if it starts with a '!', remove it from the set.
    const dictIdSet = dictIds
        .map(id => id.trim())
        .filter(id => !!id)
        .reduce((dictSet, id) => {
            if (id[0] === '!') {
                dictSet.delete(id.slice(1));
            } else {
                dictSet.add(id);
            }
            return dictSet;
        }, new Set<DictionaryId>());
    const activeDefs: DefMapArrayItem[] = defs
        .filter(({name}) => dictIdSet.has(name))
        .map(def => ({...def, path: getFullPathName(def)}))
        // Remove any empty paths.
        .filter(def => !!def.path)
        .map(def => [ def.name, def] as DefMapArrayItem);
    return [...(new Map(activeDefs))];
}

function getFullPathName(def: DictionaryDefinition) {
    const { path: filePath = '', file = '' } = def;
    if (filePath + file === '') {
        return '';
    }
    const dictPath = path.join(filePath || dictionaryPath(), file);
    return path.resolve(dictPath);
}

export function normalizePathForDictDefs(defs: DictionaryDefinition[], defaultPath: string): DictionaryDefinition[] {
    return defs
        .map(def => normalizePathForDictDef(def, defaultPath));
}

export function normalizePathForDictDef(def: DictionaryDefinition, defaultPath: string): DictionaryDefinition {
        const { path: relPath = '.' } = def;
        const absPath = relPath.match(/^\./) ? path.join(defaultPath, relPath) : relPath;
        return {
            ...def,
            path:  absPath
        };
}

