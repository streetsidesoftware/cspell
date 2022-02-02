import { WeightMap } from '..';
import { CompoundWordsMethod } from '../walker';

export interface GenSuggestionOptionsStrict {
    /**
     * Controls forcing compound words.
     * @default CompoundWordsMethod.NONE
     */
    compoundMethod?: CompoundWordsMethod;

    /**
     * ignore case when searching.
     */
    ignoreCase: boolean;

    /**
     * Maximum number of "edits" allowed.
     * 3 is a good number. Above 5 can be very slow.
     */
    changeLimit: number;

    /**
     * Include the `+` compound character when returning results.
     * @default false
     */
    includeCompoundChar?: boolean;
}

export type GenSuggestionOptions = Partial<GenSuggestionOptionsStrict>;

export interface SuggestionOptionsStrict extends GenSuggestionOptionsStrict {
    /**
     * Maximum number of suggestions to make.
     */
    numSuggestions: number;

    /**
     * Allow ties when making suggestions.
     * if `true` it is possible to have more than `numSuggestions`.
     */
    includeTies: boolean;

    /**
     * Time alloted in milliseconds to generate suggestions.
     */
    timeout: number;

    /**
     * Optional filter function.
     * return true to keep the candidate.
     */
    filter?: (word: string, cost: number) => boolean;

    /**
     * Apply weights to improve the suggestions.
     */
    weightMap?: WeightMap;
}

export type SuggestionOptions = Partial<SuggestionOptionsStrict>;

export const defaultGenSuggestionOptions: GenSuggestionOptionsStrict = {
    compoundMethod: CompoundWordsMethod.NONE,
    ignoreCase: true,
    changeLimit: 5,
    includeCompoundChar: false,
};

export const defaultSuggestionOptions: SuggestionOptionsStrict = {
    ...defaultGenSuggestionOptions,
    numSuggestions: 8,
    includeTies: true,
    timeout: 5000,
};

type KeyOfGenSuggestionOptionsStrict = keyof GenSuggestionOptionsStrict;

type KeyMapOfGenSuggestionOptionsStrict = {
    [K in KeyOfGenSuggestionOptionsStrict]: K;
};

type KeyOfSuggestionOptionsStrict = keyof SuggestionOptionsStrict;

type KeyMapOfSuggestionOptionsStrict = {
    [K in KeyOfSuggestionOptionsStrict]: K;
};

const keyMapOfGenSuggestionOptionsStrict: KeyMapOfGenSuggestionOptionsStrict = {
    changeLimit: 'changeLimit',
    compoundMethod: 'compoundMethod',
    ignoreCase: 'ignoreCase',
    includeCompoundChar: 'includeCompoundChar',
} as const;

const keyMapOfSuggestionOptionsStrict: KeyMapOfSuggestionOptionsStrict = {
    ...keyMapOfGenSuggestionOptionsStrict,
    filter: 'filter',
    includeTies: 'includeTies',
    numSuggestions: 'numSuggestions',
    timeout: 'timeout',
    weightMap: 'weightMap',
};

/**
 * Create suggestion options using composition.
 * @param opts - partial options.
 * @returns Options - with defaults.
 */
export function createSuggestionOptions(...opts: SuggestionOptions[]): SuggestionOptionsStrict {
    const options = { ...defaultSuggestionOptions };
    const keys = Object.keys(keyMapOfSuggestionOptionsStrict) as (keyof SuggestionOptions)[];
    for (const opt of opts) {
        for (const key of keys) {
            assign(options, opt, key);
        }
    }
    return options;
}

function assign<T, K extends keyof T>(dest: T, src: Partial<T>, k: K) {
    dest[k] = src[k] ?? dest[k];
}
