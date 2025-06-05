import type { DictionaryInformation } from './DictionaryInformation.js';
import type { InlineDictionary } from './InlineDictionary.js';

export type DictionaryDefinition =
    | DictionaryDefinitionPreferred
    | DictionaryDefinitionCustom
    | DictionaryDefinitionAugmented
    | DictionaryDefinitionInline
    | DictionaryDefinitionSimple
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

    /**
     * Optional description of the contents / purpose of the dictionary.
     */
    description?: string | undefined;

    /** Replacement pairs. */
    repMap?: ReplaceMap | undefined;

    /** Use Compounds. */
    useCompounds?: boolean | undefined;

    /**
     * Indicate that suggestions should not come from this dictionary.
     * Words in this dictionary are considered correct, but will not be
     * used when making spell correction suggestions.
     *
     * Note: if a word is suggested by another dictionary, but found in
     * this dictionary, it will be removed from the set of
     * possible suggestions.
     */
    noSuggest?: boolean | undefined;

    /**
     * Some dictionaries may contain forbidden words to prevent compounding from generating
     * words that are not valid in the language. These are often
     * words that are used in other languages or might be generated through compounding.
     * This setting allows flagged words to be ignored when checking the dictionary.
     * The effect is similar to the word not being in the dictionary.
     */
    ignoreForbiddenWords?: boolean | undefined;

    /**
     * Type of file:
     * - S - single word per line,
     * - W - each line can contain one or more words separated by space,
     * - C - each line is treated like code (Camel Case is allowed).
     *
     * Default is S.
     *
     * C is the slowest to load due to the need to split each line based upon code splitting rules.
     *
     * Note: this settings does not apply to inline dictionaries or `.trie` files.
     *
     * @default "S"
     */
    type?: DictionaryFileTypes | undefined;

    /**
     * Strip case and accents to allow for case insensitive searches and
     * words without accents.
     *
     * Note: this setting only applies to word lists. It has no-impact on trie
     * dictionaries.
     *
     * @default true
     */
    supportNonStrictSearches?: boolean | undefined;
}

export interface DictionaryDefinitionPreferred extends DictionaryDefinitionBase {
    /** Path to the file. */
    path: DictionaryPath;

    /**
     * Only for legacy dictionary definitions.
     * @deprecated true
     * @deprecationMessage Use {@link path} instead.
     * @hidden
     */
    file?: undefined;
}

/**
 * An Empty Dictionary Definition
 */
export interface DictionaryDefinitionSimple extends DictionaryDefinitionBase {
    /**
     * @hide
     */
    repMap?: ReplaceMap | undefined;

    /**
     * @hide
     */
    useCompounds?: boolean | undefined;

    /**
     * @hide
     */
    noSuggest?: boolean | undefined;

    /**
     * @hide
     */
    ignoreForbiddenWords?: boolean | undefined;

    /**
     * @hide
     */
    type?: DictionaryFileTypes | undefined;

    /**
     * @hide
     */
    path?: string | undefined;

    /**
     * @hide
     */
    file?: undefined;
}

/**
 * Used to provide extra data related to the dictionary
 */
export interface DictionaryDefinitionAugmented extends DictionaryDefinitionPreferred {
    dictionaryInformation?: DictionaryInformation;
}

interface HiddenFields {
    /**
     * Not used
     * @hide
     */
    path?: undefined;

    /**
     * Not used
     * @hide
     */
    file?: undefined;

    /**
     * Not used
     * @hide
     */
    type?: undefined;

    /**
     * Use `ignoreWords` instead.
     * @hide
     */
    noSuggest?: undefined;

    /**
     * Not used
     * @hide
     */
    ignoreForbiddenWords?: undefined;

    /**
     * Not used
     * @hide
     */
    useCompounds?: undefined;

    /**
     * @hide
     */
    repMap?: undefined;
}

/**
 * Inline Dictionary Definition
 *
 * All words are defined inline.
 */
type DictionaryDefinitionInlineBase = Omit<DictionaryDefinitionBase, keyof HiddenFields> &
    HiddenFields &
    InlineDictionary;

export interface DictionaryDefinitionInlineWords
    extends DictionaryDefinitionInlineBase,
        Required<Pick<InlineDictionary, 'words'>> {
    words: string[];
}

export interface DictionaryDefinitionInlineFlagWords
    extends DictionaryDefinitionInlineBase,
        Required<Pick<InlineDictionary, 'flagWords'>> {
    flagWords: string[];
}

export interface DictionaryDefinitionInlineIgnoreWords
    extends DictionaryDefinitionInlineBase,
        Required<Pick<InlineDictionary, 'ignoreWords'>> {
    ignoreWords: string[];
}

export interface DictionaryDefinitionInlineSuggestWords
    extends DictionaryDefinitionInlineBase,
        Required<Pick<InlineDictionary, 'suggestWords'>> {
    suggestWords: string[];
}

/**
 * Inline Dictionary Definitions
 * @since 6.23.0
 */
export type DictionaryDefinitionInline =
    | DictionaryDefinitionInlineWords
    | DictionaryDefinitionInlineIgnoreWords
    | DictionaryDefinitionInlineFlagWords
    | DictionaryDefinitionInlineSuggestWords;

/**
 * Only for legacy dictionary definitions.
 * @deprecated true
 * @deprecationMessage Use {@link DictionaryDefinitionPreferred} instead.
 */
export interface DictionaryDefinitionAlternate extends DictionaryDefinitionBase {
    /**
     * @hidden
     */
    path?: undefined;

    /**
     * Path to the file, only for legacy dictionary definitions.
     * @deprecated true
     * @deprecationMessage Use `path` instead.
     */
    file: DictionaryPath;

    /**
     * @hidden
     */
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
     * @deprecationMessage Use {@link path} instead.
     */
    file: FsDictionaryPath;
    /**
     * Type of file:
     * - S - single word per line,
     * - W - each line can contain one or more words separated by space,
     * - C - each line is treated like code (Camel Case is allowed).
     *
     * Default is S.
     *
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
 *
 * Note: only plain text files with one word per line are supported at this moment.
 */
export interface DictionaryDefinitionCustom extends DictionaryDefinitionPreferred {
    /** Path to custom dictionary text file. */
    path: CustomDictionaryPath;

    /**
     * Defines the scope for when words will be added to the dictionary.
     *
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
 * Pattern: `^.*\.(?:txt|trie|dic)(?:\.gz)?$`
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
