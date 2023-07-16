import type { CompoundWordsMethod } from 'cspell-trie-lib';

export interface SuggestOptions {
    /**
     * Compounding Mode.
     * `NONE` is the best option.
     */
    compoundMethod?: CompoundWordsMethod | undefined;

    /**
     * The limit on the number of suggestions to generate. If `allowTies` is true, it is possible
     * for more suggestions to be generated.
     */
    numSuggestions?: number | undefined;

    /**
     * Max number of changes / edits to the word to get to a suggestion matching suggestion.
     */
    numChanges?: number | undefined;

    /**
     * Allow for case-ingestive checking.
     */
    ignoreCase?: boolean | undefined;

    /**
     * If multiple suggestions have the same edit / change "cost", then included them even if
     * it causes more than `numSuggestions` to be returned.
     * @default false
     */
    includeTies?: boolean | undefined;

    /**
     * Maximum amount of time to allow for generating suggestions.
     */
    timeout?: number | undefined;
}

export function createSuggestOptions(
    numSuggestions?: number,
    compoundMethod?: CompoundWordsMethod,
    numChanges?: number,
    ignoreCase?: boolean,
): SuggestOptions {
    return {
        numSuggestions,
        compoundMethod,
        numChanges,
        ignoreCase,
    };
}
