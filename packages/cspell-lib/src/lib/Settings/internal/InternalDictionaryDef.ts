import type {
    DictionaryDefinition,
    DictionaryDefinitionAugmented,
    DictionaryDefinitionCustom,
    DictionaryDefinitionInline,
    DictionaryDefinitionPreferred,
    DictionaryDefinitionSimple,
} from '@cspell/cspell-types';
import type { WeightMap } from 'cspell-trie-lib';

type DictionaryDefinitionCustomUniqueFields = Omit<DictionaryDefinitionCustom, keyof DictionaryDefinitionPreferred>;

export type DictionaryDefinitionInternal =
    | DictionaryFileDefinitionInternal
    | DictionaryDefinitionInlineInternal
    | DictionaryDefinitionSimpleInternal;

export type DictionaryDefinitionInlineInternal = DictionaryDefinitionInline & {
    /** The path to the config file that contains this dictionary definition */
    readonly __source?: string | undefined;
};

export type DictionaryDefinitionSimpleInternal = DictionaryDefinitionSimple & {
    /** The path to the config file that contains this dictionary definition */
    readonly __source?: string | undefined;
};

export interface DictionaryFileDefinitionInternal
    extends
        Readonly<DictionaryDefinitionPreferred>,
        Readonly<Partial<DictionaryDefinitionCustomUniqueFields>>,
        Readonly<DictionaryDefinitionAugmented> {
    /**
     * Optional weight map used to improve suggestions.
     */
    readonly weightMap?: WeightMap | undefined;
    /** The path to the config file that contains this dictionary definition */
    readonly __source?: string | undefined;
}

export interface DictionaryFileDefinitionInternalWithSource extends DictionaryFileDefinitionInternal {
    readonly __source: string;
}

export type DictionaryDefinitionInternalWithSource = DictionaryDefinitionInternal & {
    readonly __source: string;
};

export function isDictionaryDefinitionInlineInternal(
    def: DictionaryDefinitionInternal | DictionaryDefinitionInline | DictionaryDefinition,
): def is DictionaryDefinitionInlineInternal {
    if (def.path) return false;
    const defInline = def as DictionaryDefinitionInline;
    return !!(defInline.words || defInline.flagWords || defInline.ignoreWords || defInline.suggestWords);
}

export function isDictionaryFileDefinitionInternal(
    def: DictionaryDefinitionInternal | DictionaryDefinitionInline | DictionaryDefinition,
): def is DictionaryFileDefinitionInternal {
    return !!(def.path || def.file);
}
