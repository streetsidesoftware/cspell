import type { DictionaryDefinition, DictionaryDefinitionPreferred, DictionaryReference } from '@cspell/cspell-types';
import * as path from 'path';
import { resolveFile } from '../util/resolveFile';
import {
    CSpellSettingsInternal,
    DictionaryDefinitionInternal,
    DictionaryDefinitionInternalWithSource,
} from '../Models/CSpellSettingsInternalDef';
import { createDictionaryReferenceCollection } from './DictionaryReferenceCollection';

export type DefMapArrayItem = [string, DictionaryDefinitionInternal];

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
export function filterDictDefsToLoad(
    dictRefIds: DictionaryReference[],
    defs: DictionaryDefinitionInternal[]
): DictionaryDefinitionInternal[] {
    function isDefP(def: DictionaryDefinition): def is DictionaryDefinitionPreferred {
        return !!def.path;
    }

    const col = createDictionaryReferenceCollection(dictRefIds);
    const dictIdSet = new Set(col.enabled());
    const allActiveDefs = defs
        .filter(({ name }) => dictIdSet.has(name))
        .map((def) => ({ ...def, path: getFullPathName(def) }))
        // Remove any empty paths.
        .filter(isDefP);
    return [...new Map(allActiveDefs.map((d) => [d.name, d])).values()];
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
): DictionaryDefinitionInternalWithSource[];
export function normalizePathForDictDefs(
    defs: DictionaryDefinition[] | undefined,
    pathToSettingsFile: string
): DictionaryDefinitionInternalWithSource[] | undefined;
export function normalizePathForDictDefs(
    defs: DictionaryDefinition[] | undefined,
    pathToSettingsFile: string
): DictionaryDefinitionInternalWithSource[] | undefined {
    return defs?.map((def) => normalizePathForDictDef(def, pathToSettingsFile));
}

export function normalizePathForDictDef(
    def: DictionaryDefinition,
    pathToSettingsFile: string
): DictionaryDefinitionInternalWithSource {
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
        weightMap: undefined,
        __source: pathToSettingsFile,
    };
}

export function isDictionaryDefinitionWithSource(
    d: DictionaryDefinition | DictionaryDefinitionInternalWithSource
): d is DictionaryDefinitionInternalWithSource {
    return (d as DictionaryDefinitionInternalWithSource).__source !== undefined;
}

function determineName(filename: string, options: DictionaryDefinition): string {
    return options.name || path.basename(filename);
}

export function calcDictionaryDefsToLoad(settings: CSpellSettingsInternal): DictionaryDefinitionInternal[] {
    const { dictionaries = [], dictionaryDefinitions = [], noSuggestDictionaries = [] } = settings;
    const colNoSug = createDictionaryReferenceCollection(noSuggestDictionaries);
    const colDicts = createDictionaryReferenceCollection(dictionaries.concat(colNoSug.enabled()));
    const modDefs = dictionaryDefinitions.map((def) => {
        const enabled = colNoSug.isEnabled(def.name);
        if (enabled === undefined) return def;
        return { ...def, noSuggest: enabled };
    });
    return filterDictDefsToLoad(colDicts.enabled(), modDefs);
}
