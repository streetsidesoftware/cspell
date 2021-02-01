import { DictionaryDefinition, DictionaryId, DictionaryDefinitionPreferred } from '@cspell/cspell-types';
import * as path from 'path';
import { resolveFile } from '../util/resolveFile';

export interface DictionaryDefinitionWithSource extends DictionaryDefinitionPreferred {
    /** The path to the config file that contains this dictionary definition */
    __source: string;
}

export type DefMapArrayItem = [string, DictionaryDefinitionPreferred];

export function filterDictDefsToLoad(dictIds: DictionaryId[], defs: DictionaryDefinition[]): DefMapArrayItem[] {
    // Process the dictIds in order, if it starts with a '!', remove it from the set.
    const dictIdSet = dictIds
        .map((id) => id.trim())
        .filter((id) => !!id)
        .reduce((dictSet, id) => {
            if (id[0] === '!') {
                dictSet.delete(id.slice(1));
            } else {
                dictSet.add(id);
            }
            return dictSet;
        }, new Set<DictionaryId>());
    const activeDefs: DefMapArrayItem[] = defs
        .filter(({ name }) => dictIdSet.has(name))
        .map((def) => ({ ...def, path: getFullPathName(def) }))
        // Remove any empty paths.
        .filter((def) => !!def.path)
        .map((def) => [def.name, def] as DefMapArrayItem);
    return [...new Map(activeDefs)];
}

function getFullPathName(def: DictionaryDefinition) {
    const { path: filePath = '', file = '' } = def;
    if (!filePath && !file) {
        return '';
    }
    return path.join(filePath, file);
}

export function normalizePathForDictDefs(
    defs: DictionaryDefinition[],
    pathToSettingsFile: string
): DictionaryDefinitionPreferred[] {
    return defs.map((def) => normalizePathForDictDef(def, pathToSettingsFile));
}

export function normalizePathForDictDef(
    def: DictionaryDefinition,
    pathToSettingsFile: string
): DictionaryDefinitionWithSource {
    const defaultPath = path.dirname(pathToSettingsFile);
    const { path: relPath = '', file = '', ...rest } = def;
    const filePath = path.join(relPath, file);

    if (isDictionaryDefinitionWithSource(def)) {
        if (def.__source !== pathToSettingsFile) {
            throw new Error('Trying to normalize a dictionary definition with a different source.');
        }
        return def;
    }

    const r = resolveFile(filePath, defaultPath);
    return {
        ...rest,
        path: r.filename,
        __source: pathToSettingsFile,
    };
}

export function isDictionaryDefinitionWithSource(
    d: DictionaryDefinition | DictionaryDefinitionWithSource
): d is DictionaryDefinitionWithSource {
    return (d as DictionaryDefinitionWithSource).__source !== undefined;
}
