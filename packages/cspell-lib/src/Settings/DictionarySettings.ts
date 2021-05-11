import { DictionaryDefinition, DictionaryId, DictionaryDefinitionPreferred } from '@cspell/cspell-types';
import * as path from 'path';
import { resolveFile } from '../util/resolveFile';

export interface DictionaryDefinitionWithSource extends DictionaryDefinitionPreferred {
    /** The path to the config file that contains this dictionary definition */
    __source: string;
}

export type DefMapArrayItem = [string, DictionaryDefinitionPreferred];

/**
 * Combines the list of desired dictionaries with the list of dictionary
 * definitions. Order does not matter, but the number of leading `!` does.
 *
 * Excluding dictionaries.
 * - Adding `!` to a dictId will remove the dictionary.
 * - Adding `!!` will add it back.
 *
 * @param dictIds - dictionaries desired
 * @param defs - dictionary definitions
 * @returns map from dictIds to definitions
 */
export function filterDictDefsToLoad(dictIds: DictionaryId[], defs: DictionaryDefinition[]): DefMapArrayItem[] {
    const negPrefixRegEx = /^!+/;

    // Collect the ids based upon the `!` depth.
    const dictIdMap = dictIds
        .map((id) => id.trim())
        .filter((id) => !!id)
        .reduce((dictDepthMap, id) => {
            const pfx = id.match(negPrefixRegEx);
            const depth = pfx?.[0]?.length || 0;
            const _dictSet = dictDepthMap.get(depth);
            const dictSet = _dictSet || new Set<DictionaryId>();
            if (!_dictSet) {
                dictDepthMap.set(depth, dictSet);
            }
            dictSet.add(id.slice(depth));
            return dictDepthMap;
        }, new Map<number, Set<DictionaryId>>());

    const orderedSets = [...dictIdMap].sort((a, b) => a[0] - b[0]);
    const dictIdSet = orderedSets.reduce((dictIdSet, [depth, ids]) => {
        if (depth & 1) {
            [...ids].forEach((id) => dictIdSet.delete(id));
        } else {
            [...ids].forEach((id) => dictIdSet.add(id));
        }
        return dictIdSet;
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

export function normalizePathForDictDefs(defs: undefined, pathToSettingsFile: string): undefined;
export function normalizePathForDictDefs(
    defs: DictionaryDefinition[],
    pathToSettingsFile: string
): DictionaryDefinitionWithSource[];
export function normalizePathForDictDefs(
    defs: DictionaryDefinition[] | undefined,
    pathToSettingsFile: string
): DictionaryDefinitionWithSource[] | undefined;
export function normalizePathForDictDefs(
    defs: DictionaryDefinition[] | undefined,
    pathToSettingsFile: string
): DictionaryDefinitionWithSource[] | undefined {
    return defs?.map((def) => normalizePathForDictDef(def, pathToSettingsFile));
}

export function normalizePathForDictDef(
    def: DictionaryDefinition,
    pathToSettingsFile: string
): DictionaryDefinitionWithSource {
    const defaultPath = path.dirname(pathToSettingsFile);
    const { path: relPath = '', file = '', ...rest } = def;
    const filePath = path.join(relPath, file);
    const name = determineName(filePath, def);

    if (isDictionaryDefinitionWithSource(def)) {
        if (def.__source !== pathToSettingsFile) {
            throw new Error('Trying to normalize a dictionary definition with a different source.');
        }
        return def;
    }

    const r = resolveFile(filePath, defaultPath);
    return {
        ...rest,
        name,
        path: r.filename,
        __source: pathToSettingsFile,
    };
}

export function isDictionaryDefinitionWithSource(
    d: DictionaryDefinition | DictionaryDefinitionWithSource
): d is DictionaryDefinitionWithSource {
    return (d as DictionaryDefinitionWithSource).__source !== undefined;
}

function determineName(filename: string, options: DictionaryDefinition): string {
    return options.name || path.basename(filename);
}
