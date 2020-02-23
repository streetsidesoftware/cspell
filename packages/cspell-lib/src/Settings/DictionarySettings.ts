import { DictionaryDefinition, DictionaryId, DictionaryDefinitionPreferred } from './CSpellSettingsDef';
import * as path from 'path';
import * as os from 'os';

const dictionaryPath = () => path.join(__dirname, '..', '..', 'dist', 'dictionaries');

export type DefMapArrayItem = [string, DictionaryDefinitionPreferred];

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
    if (!filePath && !file) {
        return '';
    }
    const dictPath = path.join(filePath || dictionaryPath(), file);
    return path.resolve(dictPath);
}

export function normalizePathForDictDefs(defs: DictionaryDefinition[], defaultPath: string): DictionaryDefinitionPreferred[] {
    return defs
        .map(def => normalizePathForDictDef(def, defaultPath));
}

export function normalizePathForDictDef(def: DictionaryDefinition, defaultPath: string): DictionaryDefinitionPreferred {
        const { path: relPath = '.', file, ...rest } = def;
        const nonRelPath = relPath.match(/^\./) ? path.join(defaultPath, relPath) : relPath;
        const absPath = nonRelPath.replace(/^~/, os.homedir());
        const fullPath = file ? path.join(absPath, file) : absPath;
        return {
            ...rest,
            path: fullPath
        };
}
