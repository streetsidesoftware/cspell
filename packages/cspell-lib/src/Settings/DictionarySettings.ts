import type {
    CustomDictionaryScope,
    DictionaryDefinition,
    DictionaryDefinitionPreferred,
    DictionaryDefinitionAugmented,
    DictionaryDefinitionCustom,
    DictionaryFileTypes,
    DictionaryReference,
    ReplaceMap,
} from '@cspell/cspell-types';
import * as path from 'path';
import { resolveFile } from '../util/resolveFile';
import {
    CSpellSettingsInternal,
    DictionaryDefinitionInternal,
    DictionaryDefinitionInternalWithSource,
} from '../Models/CSpellSettingsInternalDef';
import { createDictionaryReferenceCollection } from './DictionaryReferenceCollection';
import { mapDictionaryInformationToWeightMap, WeightMap } from 'cspell-trie-lib';
import { DictionaryInformation } from '@cspell/cspell-types';
import { RequireOptional, UnionFields } from '../util/types';

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

export function mapDictDefsToInternal(defs: undefined, pathToSettingsFile: string): undefined;
export function mapDictDefsToInternal(
    defs: DictionaryDefinition[],
    pathToSettingsFile: string
): DictionaryDefinitionInternalWithSource[];
export function mapDictDefsToInternal(
    defs: DictionaryDefinition[] | undefined,
    pathToSettingsFile: string
): DictionaryDefinitionInternalWithSource[] | undefined;
export function mapDictDefsToInternal(
    defs: DictionaryDefinition[] | undefined,
    pathToSettingsFile: string
): DictionaryDefinitionInternalWithSource[] | undefined {
    return defs?.map((def) => mapDictDefToInternal(def, pathToSettingsFile));
}

export function mapDictDefToInternal(
    def: DictionaryDefinition,
    pathToSettingsFile: string
): DictionaryDefinitionInternalWithSource {
    if (isDictionaryDefinitionWithSource(def)) {
        if (def.__source !== pathToSettingsFile) {
            throw new Error('Trying to normalize a dictionary definition with a different source.');
        }
        return def;
    }

    return new _DictionaryDefinitionInternalWithSource(def, pathToSettingsFile);
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

type DictDef = Partial<
    UnionFields<UnionFields<DictionaryDefinition, DictionaryDefinitionAugmented>, DictionaryDefinitionCustom>
>;

class _DictionaryDefinitionInternalWithSource implements RequireOptional<DictionaryDefinitionInternalWithSource> {
    private _weightMap: WeightMap | undefined;
    readonly name: string;
    readonly path: string;
    readonly addWords: boolean | undefined;
    readonly description: string | undefined;
    readonly dictionaryInformation: DictionaryInformation | undefined;
    readonly type: DictionaryFileTypes | undefined;
    readonly file: undefined;
    readonly repMap: ReplaceMap | undefined;
    readonly useCompounds: boolean | undefined;
    readonly noSuggest: boolean | undefined;
    readonly scope: CustomDictionaryScope | CustomDictionaryScope[] | undefined;
    constructor(def: DictionaryDefinition, readonly __source: string) {
        // this bit of assignment is to have the compiler help use if any new fields are added.
        const defAll: DictDef = def;
        const {
            path: relPath = '',
            file = '',
            addWords,
            description,
            dictionaryInformation,
            type,
            repMap,
            noSuggest,
            scope,
            useCompounds,
        } = defAll;
        const defaultPath = path.dirname(__source);
        const filePath = path.join(relPath, file);
        const name = determineName(filePath, def);

        const r = resolveFile(filePath, defaultPath);

        const ddi: Omit<RequireOptional<DictionaryDefinitionInternalWithSource>, '__source' | 'weightMap'> = {
            name,
            file: undefined,
            path: r.filename,
            addWords,
            description,
            dictionaryInformation,
            type,
            repMap,
            noSuggest,
            scope,
            useCompounds,
        };

        this.name = ddi.name;
        this.file = ddi.file;
        this.path = ddi.path;
        this.addWords = ddi.addWords;
        this.description = ddi.description;
        this.dictionaryInformation = ddi.dictionaryInformation;
        this.type = ddi.type;
        this.repMap = ddi.repMap;
        this.noSuggest = ddi.noSuggest;
        this.scope = ddi.scope;
        this.useCompounds = ddi.useCompounds;
        this._weightMap = this.dictionaryInformation
            ? mapDictionaryInformationToWeightMap(this.dictionaryInformation)
            : undefined;
    }

    get weightMap() {
        return this._weightMap;
    }
}
