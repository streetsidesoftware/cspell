import type {
    CSpellSettings,
    DictionaryDefinitionInline,
    DictionaryDefinitionPreferred,
    DictionaryDefinitionSimple,
} from '@cspell/cspell-types';

export interface Options extends Check {
    /**
     * Number of spelling suggestions to make.
     * @default 8
     */
    numSuggestions: number;

    /**
     * Generate suggestions
     * @default true
     */
    generateSuggestions: boolean;

    /**
     * Automatically fix common mistakes.
     * This is only possible if a single preferred suggestion is available.
     * @default false
     */
    autoFix: boolean;

    /**
     * Output debug logs to `.cspell-eslint-plugin.log`
     * default false
     */
    debugMode?: boolean;
}

interface DictOptions {
    /**
     * Strip case and accents to allow for case insensitive searches and
     * words without accents.
     *
     * Note: this setting only applies to word lists. It has no-impact on trie
     * dictionaries.
     */
    supportNonStrictSearches?: boolean | undefined;
}

type DictBase = Pick<DictionaryDefinitionSimple, 'name' | 'description'> & DictOptions;

type SimpleInlineDefinition = DictBase &
    Partial<Pick<DictionaryDefinitionInline, 'words' | 'flagWords' | 'ignoreWords' | 'suggestWords'>>;

type DictionaryDefinition = (DictBase & Pick<DictionaryDefinitionPreferred, 'path'>) | SimpleInlineDefinition;

export type CSpellOptions = Pick<
    CSpellSettings,
    // | 'languageSettings'
    // | 'overrides'
    | 'allowCompoundWords'
    | 'caseSensitive'
    | 'dictionaries'
    | 'enabled'
    | 'flagWords'
    | 'ignoreWords'
    | 'ignoreRegExpList'
    | 'includeRegExpList'
    | 'import'
    | 'language'
    | 'words'
> & {
    dictionaryDefinitions?: DictionaryDefinition[];
};

export type RequiredOptions = Required<Pick<Options, Exclude<keyof Options, 'debugMode'>>> & Pick<Options, 'debugMode'>;

export interface Check {
    /**
     * Ignore import and require names
     * @default true
     */
    ignoreImports?: boolean;
    /**
     * Ignore the properties of imported variables, structures, and types.
     *
     * Example:
     * ```
     * import { example } from 'third-party';
     *
     * const msg = example.property; // `property` is not spell checked.
     * ```
     *
     * @default true
     */
    ignoreImportProperties?: boolean;
    /**
     * Spell check identifiers (variables names, function names, class names, etc.)
     * @default true
     */
    checkIdentifiers?: boolean;
    /**
     * Spell check strings
     * @default true
     */
    checkStrings?: boolean;
    /**
     * Spell check template strings
     * @default true
     */
    checkStringTemplates?: boolean;
    /**
     * Spell check JSX Text
     * @default true
     */
    checkJSXText?: boolean;
    /**
     * Spell check comments
     * @default true
     */
    checkComments?: boolean;
    /**
     * Path to the cspell configuration file.
     * Relative paths, will be relative to the current working directory.
     * @since 8.8.0
     */
    configFile?: string;
    /**
     * CSpell options to pass to the spell checker.
     */
    cspell?: CSpellOptions;
    /**
     * Specify the root path of the cspell configuration.
     * It is used to resolve `imports` found in {@link cspell}.
     *
     * example:
     * ```js
     * cspellOptionsRoot: import.meta.url
     * // or
     * cspellOptionsRoot: __filename
     * ```
     */
    cspellOptionsRoot?: string | URL;
    /**
     * Specify a path to a custom word list file.
     *
     * example:
     * ```js
     * customWordListFile: "./myWords.txt"
     * ```
     */
    customWordListFile?: CustomWordListFilePath | CustomWordListFile | undefined;

    /**
     * Scope selectors to spell check.
     * This is a list of scope selectors to spell check.
     *
     * Example:
     * ```js
     * checkScope: [
     *     ['YAMLPair[key] YAMLScalar', true],
     *     ['YAMLPair[value] YAMLScalar', true],
     *     ['YAMLSequence[entries] YAMLScalar', true],
     *     ['JSONProperty[key] JSONLiteral', true],
     *     ['JSONProperty[value] JSONLiteral', true],
     *     ['JSONArrayExpression JSONLiteral', true],
     * ],
     * ```
     *
     * @since 8.9.0
     */
    checkScope?: ScopeSelectorList;
}

/**
 * Specify a path to a custom word list file
 */
export type CustomWordListFilePath = string;

export interface CustomWordListFile {
    /**
     * Path to word list file.
     * File format: 1 word per line
     */
    path: CustomWordListFilePath;
}

export type WorkerOptions = RequiredOptions & { cwd: string };

export const defaultOptions: Options = {
    numSuggestions: 8,
    generateSuggestions: true,
    autoFix: false,
};

/**
 * The scope selector is a string that defines the context in which a rule applies.
 * Examples:
 * - `YAMLPair[value] YAMLScalar` - check the value of a YAML pair.
 * - `YAMLPair[key] YAMLScalar` - check the key of a YAML pair.
 */
export type ScopeSelector = string;

/**
 * A scope selector entry is a tuple that defines a scope selector and whether to spell check it.
 */
export type ScopeSelectorEntry = [ScopeSelector, boolean];

/**
 * A list of scope selectors.
 */
export type ScopeSelectorList = ScopeSelectorEntry[];

/**
 * Helper to define the options for the cspell-eslint-plugin.
 * @param options - The options to define.
 */
export function defineCSpellPluginOptions(options: Partial<Options>): Partial<Options> {
    return options;
}

/**
 * Helper to define the CSpell config section of the cspell-eslint-plugin.
 * @param cfg - The CSpell config to define.
 */
export function defineCSpellConfig(cfg: CSpellOptions): CSpellOptions {
    return cfg;
}
