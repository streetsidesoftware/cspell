import type { DictionaryInformation } from './DictionaryInformation';

export type DictionaryDefinition =
    | DictionaryDefinitionPreferred
    | DictionaryDefinitionCustom
    | DictionaryDefinitionAugmented
    | DictionaryDefinitionAlternate
    | DictionaryDefinitionLegacy;

export type DictionaryFileTypes = 'S' | 'W' | 'C' | 'T';

export interface DictionaryDefinitionBase {
    /**
     * This is the name of a dictionary.
     *
     * Name Format:
     * - Must contain at least 1 number or letter.
     * - Spaces are allowed.
     * - Leading and trailing space will be removed.
     * - Names ARE case-sensitive.
     * - Must not contain `*`, `!`, `;`, `,`, `{`, `}`, `[`, `]`, `~`.
     */
    name: DictionaryId;
    /** Optional description. */
    description?: string;
    /** Replacement pairs. */
    repMap?: ReplaceMap;
    /** Use Compounds. */
    useCompounds?: boolean;
    /**
     * Indicate that suggestions should not come from this dictionary.
     * Words in this dictionary are considered correct, but will not be
     * used when making spell correction suggestions.
     *
     * Note: if a word is suggested by another dictionary, but found in
     * this dictionary, it will be removed from the set of
     * possible suggestions.
     */
    noSuggest?: boolean;
    /**
     * Type of file:
     * S - single word per line,
     * W - each line can contain one or more words separated by space,
     * C - each line is treated like code (Camel Case is allowed).
     * Default is S.
     * C is the slowest to load due to the need to split each line based upon code splitting rules.
     * @default "S"
     */
    type?: DictionaryFileTypes;
}

export interface DictionaryDefinitionPreferred extends DictionaryDefinitionBase {
    /** Path to the file. */
    path: DictionaryPath;

    /**
     * Only for legacy dictionary definitions.
     * @deprecated true
     * @deprecationMessage Use `path` instead.
     * @hidden
     */
    file?: undefined;
}
/**
 * Used to provide extra data related to the dictionary
 */
export interface DictionaryDefinitionAugmented extends DictionaryDefinitionPreferred {
    dictionaryInformation?: DictionaryInformation;
}
/**
 * Only for legacy dictionary definitions.
 * @deprecated true
 * @deprecationMessage Use `DictionaryDefinitionPreferred` instead.
 */
export interface DictionaryDefinitionAlternate extends DictionaryDefinitionBase {
    /** @hidden */
    path?: undefined;

    /**
     * Path to the file, only for legacy dictionary definitions.
     * @deprecated true
     * @deprecationMessage Use `path` instead.
     */
    file: DictionaryPath;

    /** @hidden */
    suggestionEditCosts?: undefined;
}
/**
 * @deprecated true
 * @hidden
 */
export interface DictionaryDefinitionLegacy extends DictionaryDefinitionBase {
    /** Path to the file, if undefined the path to the extension dictionaries is assumed. */
    path?: FsDictionaryPath;
    /**
     * File name.
     * @deprecated true
     * @deprecationMessage Use `path` instead.
     */
    file: FsDictionaryPath;
    /**
     * Type of file:
     * S - single word per line,
     * W - each line can contain one or more words separated by space,
     * C - each line is treated like code (Camel Case is allowed).
     * Default is S.
     * C is the slowest to load due to the need to split each line based upon code splitting rules.
     * @default "S"
     */
    type?: DictionaryFileTypes;

    /**
     * @hidden
     */
    suggestionEditCosts?: undefined;
}
/**
 * Specifies the scope of a dictionary.
 */
export type CustomDictionaryScope = 'user' | 'workspace' | 'folder';
/**
 * For Defining Custom dictionaries. They are generally scoped to a
 * `user`, `workspace`, or `folder`.
 * When `addWords` is true, indicates that the spell checker can add words
 * to the file.
 * Note: only plain text files with one word per line are supported at this moment.
 */
export interface DictionaryDefinitionCustom extends DictionaryDefinitionPreferred {
    /** Path to custom dictionary text file. */
    path: CustomDictionaryPath;

    /**
     * Defines the scope for when words will be added to the dictionary.
     * Scope values: `user`, `workspace`, `folder`.
     */
    scope?: CustomDictionaryScope | CustomDictionaryScope[];

    /**
     * When `true`, let's the spell checker know that words can be added to this dictionary.
     */
    addWords: boolean;
}

/**
 * This is the name of a dictionary.
 *
 * Name Format:
 * - Must contain at least 1 number or letter.
 * - Spaces are allowed.
 * - Leading and trailing space will be removed.
 * - Names ARE case-sensitive.
 * - Must not contain `*`, `!`, `;`, `,`, `{`, `}`, `[`, `]`, `~`.
 *
 * @pattern ^(?=[^!*,;{}[\]~\n]+$)(?=(.*\w)).+$
 */
export type DictionaryId = string;

export type ReplaceEntry = [string, string];
export type ReplaceMap = ReplaceEntry[];

/**
 * A File System Path. Relative paths are relative to the configuration file.
 */
export type FsDictionaryPath = string;

/**
 * A File System Path to a dictionary file.
 * @pattern ^.*\.(?:txt|trie)(?:\.gz)?$
 */
export type DictionaryPath = string;

/**
 * A File System Path to a dictionary file.
 */
export type CustomDictionaryPath = FsDictionaryPath;

/**
 * Reference to a dictionary by name.
 * One of:
 * - {@link DictionaryRef}
 * - {@link DictionaryNegRef}
 */
export type DictionaryReference = DictionaryRef | DictionaryNegRef;
/**
 * This a reference to a named dictionary.
 * It is expected to match the name of a dictionary.
 */
export type DictionaryRef = DictionaryId;
/**
 * This a negative reference to a named dictionary.
 *
 * It is used to exclude or include a dictionary by name.
 *
 * The reference starts with 1 or more `!`.
 * - `!<dictionary_name>` - Used to exclude the dictionary matching `<dictionary_name>`.
 * - `!!<dictionary_name>` - Used to re-include a dictionary matching `<dictionary_name>`.
 *    Overrides `!<dictionary_name>`.
 * - `!!!<dictionary_name>` - Used to exclude a dictionary matching `<dictionary_name>`.
 *    Overrides `!!<dictionary_name>`.
 *
 * @pattern ^(?=!+[^!*,;{}[\]~\n]+$)(?=(.*\w)).+$
 */
export type DictionaryNegRef = string;
