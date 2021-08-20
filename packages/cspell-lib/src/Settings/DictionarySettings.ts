import { DictionaryDefinition, DictionaryDefinitionPreferred, DictionaryReference } from '@cspell/cspell-types';
import * as path from 'path';
import { resolveFile } from '../util/resolveFile';
import { createDictionaryReferenceCollection } from './DictionaryReferenceCollection';

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
export function filterDictDefsToLoad(
    dictRefIds: DictionaryReference[],
    defs: DictionaryDefinition[]
): DictionaryDefinitionPreferred[] {
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
