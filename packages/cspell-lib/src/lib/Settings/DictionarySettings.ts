import type {
    CustomDictionaryScope,
    DictionaryDefinition,
    DictionaryDefinitionAugmented,
    DictionaryDefinitionCustom,
    DictionaryFileTypes,
    DictionaryInformation,
    ReplaceMap,
} from '@cspell/cspell-types';
import type { WeightMap } from 'cspell-trie-lib';
import { mapDictionaryInformationToWeightMap } from 'cspell-trie-lib';
import * as path from 'path';

import type {
    CSpellSettingsInternal,
    DictionaryDefinitionInternal,
    DictionaryDefinitionInternalWithSource,
    DictionaryFileDefinitionInternalWithSource,
} from '../Models/CSpellSettingsInternalDef.js';
import { isDictionaryDefinitionInlineInternal } from '../Models/CSpellSettingsInternalDef.js';
import { AutoResolveWeakCache, createAutoResolveWeakWeakCache } from '../util/AutoResolve.js';
import { resolveRelativeTo } from '../util/resolveFile.js';
import type { RequireOptional, UnionFields } from '../util/types.js';
import { toFilePathOrHref } from '../util/url.js';
import { clean } from '../util/util.js';
import type { DictionaryReferenceCollection } from './DictionaryReferenceCollection.js';
import { createDictionaryReferenceCollection } from './DictionaryReferenceCollection.js';

export type DefMapArrayItem = [string, DictionaryDefinitionInternal];

/**
 * Combines the list of desired dictionaries with the list of dictionary
 * definitions. Order does not matter, but the number of leading `!` does.
 *
 * Excluding dictionaries.
 * - Adding `!` to a dictId will remove the dictionary.
 * - Adding `!!` will add it back.
 *
 * @param dictRefCol - dictionaries desired
 * @param defs - dictionary definitions
 * @returns map from dictIds to definitions
 */
export function filterDictDefsToLoad(
    dictRefCol: DictionaryReferenceCollection,
    defs: DictionaryDefinitionInternal[],
): DictionaryDefinitionInternal[] {
    const allActiveDefs = defs.filter(({ name }) => dictRefCol.isEnabled(name)).map(fixPath);
    return [...new Map(allActiveDefs.map((d) => [d.name, d])).values()];
}

function fixPath(def: DictionaryDefinitionInternal): DictionaryDefinitionInternal {
    if (def instanceof _DictionaryDefinitionInternalWithSource) {
        return def;
    }
    const newPath = fixDicPath(def.path, def.file);
    return {
        ...def,
        file: undefined,
        path: newPath,
    };
}

function fixDicPath(defPath: string | undefined, defFile: string | undefined): string {
    const parts = [defPath || '', defFile || ''].filter((p) => !!p);
    return parts.length > 1 ? path.join(...parts) : parts[0] || '';
}

export function mapDictDefsToInternal(defs: undefined, pathToSettingsFile: URL): undefined;
export function mapDictDefsToInternal(
    defs: DictionaryDefinition[],
    pathToSettingsFile: URL,
): DictionaryDefinitionInternalWithSource[];
export function mapDictDefsToInternal(
    defs: DictionaryDefinition[] | undefined,
    pathToSettingsFile: URL,
): DictionaryDefinitionInternalWithSource[] | undefined;
export function mapDictDefsToInternal(
    defs: DictionaryDefinition[] | undefined,
    pathToSettingsFile: URL,
): DictionaryDefinitionInternalWithSource[] | undefined {
    return defs?.map((def) => mapDictDefToInternal(def, pathToSettingsFile));
}

const internalDefs = createAutoResolveWeakWeakCache<DictionaryDefinition, DictionaryDefinitionInternalWithSource>();

export function mapDictDefToInternal(
    def: DictionaryDefinition,
    pathToSettingsFile: URL,
): DictionaryDefinitionInternalWithSource {
    return internalDefs.get(def, (def) => _mapDictDefToInternal(def, pathToSettingsFile));
}

function _mapDictDefToInternal(
    def: DictionaryDefinition,
    pathToSettingsFile: URL,
): DictionaryDefinitionInternalWithSource {
    if (isDictionaryDefinitionWithSource(def)) {
        return def;
    }
    const source = pathToSettingsFile.href;
    if (isDictionaryDefinitionInlineInternal(def)) {
        return { ...def, __source: source };
    }

    return new _DictionaryDefinitionInternalWithSource(def, pathToSettingsFile);
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
    return filterDictDefsToLoad(colDicts, modDefs);
}

type DictDef = Partial<
    UnionFields<UnionFields<DictionaryDefinition, DictionaryDefinitionAugmented>, DictionaryDefinitionCustom>
>;

export function isDictionaryDefinitionWithSource(
    d: DictionaryDefinition | DictionaryDefinitionInternalWithSource,
): d is DictionaryDefinitionInternalWithSource {
    return isDictionaryFileDefinitionInternalWithSource(d) || isDictionaryDefinitionInlineInternalWithSource(d);
}

export function isDictionaryDefinitionInternal(
    def: DictionaryDefinition | DictionaryDefinitionInternal,
): def is DictionaryDefinitionInternal {
    return def instanceof _DictionaryDefinitionInternalWithSource;
}

export function isDictionaryFileDefinitionInternalWithSource(
    def: DictionaryDefinition | DictionaryDefinitionInternal,
): def is DictionaryFileDefinitionInternalWithSource {
    return def instanceof _DictionaryDefinitionInternalWithSource;
}

export function isDictionaryDefinitionInlineInternalWithSource(
    def: DictionaryDefinition | DictionaryDefinitionInternal,
): def is DictionaryDefinitionInternalWithSource {
    return isDictionaryDefinitionInlineInternal(def) && !!def.__source;
}

type DDI = Omit<RequireOptional<DictionaryFileDefinitionInternalWithSource>, '__source' | 'weightMap' | 'toJSON'>;

class _DictionaryDefinitionInternalWithSource implements DictionaryFileDefinitionInternalWithSource {
    private _weightMap: WeightMap | undefined;
    readonly name: string;
    readonly path: string;
    readonly addWords?: boolean;
    readonly description?: string;
    readonly dictionaryInformation?: DictionaryInformation;
    readonly type?: DictionaryFileTypes;
    readonly file?: undefined;
    readonly repMap?: ReplaceMap;
    readonly useCompounds?: boolean;
    readonly noSuggest?: boolean;
    readonly scope?: CustomDictionaryScope | CustomDictionaryScope[];
    readonly __source: string;
    private ddi: DDI;
    constructor(
        def: DictionaryDefinition,
        readonly sourceURL: URL,
    ) {
        this.__source = sourceURL.href;
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
        const defaultPath = sourceURL;
        const filePath = fixDicPath(relPath, file);
        const name = determineName(filePath, def);

        const resolvedPath = toFilePathOrHref(resolveRelativeTo(filePath, defaultPath));

        const ddi: DDI = {
            name,
            file: undefined,
            path: resolvedPath,
            addWords,
            description,
            dictionaryInformation,
            type,
            repMap,
            noSuggest,
            scope,
            useCompounds,
        };

        Object.assign(this, clean(ddi));
        this.ddi = ddi;
        this.name = ddi.name;
        this.file = ddi.file;
        this.path = ddi.path;
        this._weightMap = this.dictionaryInformation
            ? mapDictionaryInformationToWeightMap(this.dictionaryInformation)
            : undefined;
    }

    get weightMap() {
        return this._weightMap;
    }

    toJSON() {
        return this.ddi;
    }
}
