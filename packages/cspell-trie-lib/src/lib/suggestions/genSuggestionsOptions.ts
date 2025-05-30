import type { WeightMap } from '../distance/index.js';
import { CompoundWordsMethod } from '../walker/index.js';

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
     * Inserts a compound character between compounded word segments.
     * @default ""
     */
    compoundSeparator?: string;
}

export type GenSuggestionOptionsStrictRO = Readonly<GenSuggestionOptionsStrict>;

export type GenSuggestionOptions = Partial<GenSuggestionOptionsStrict>;
export type GenSuggestionOptionsRO = Readonly<GenSuggestionOptions>;

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
    weightMap?: WeightMap | undefined;
}

export type SuggestionOptionsStrictRO = Readonly<SuggestionOptionsStrict>;

export type SuggestionOptions = Partial<SuggestionOptionsStrict>;
export type SuggestionOptionsRO = Readonly<SuggestionOptions>;

export const defaultGenSuggestionOptions: GenSuggestionOptionsStrictRO = {
    compoundMethod: CompoundWordsMethod.NONE,
    ignoreCase: true,
    changeLimit: 5,
};

export const defaultSuggestionOptions: SuggestionOptionsStrictRO = {
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
    compoundSeparator: 'compoundSeparator',
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
export function createSuggestionOptions(...opts: SuggestionOptionsRO[]): SuggestionOptionsStrictRO {
    const options = { ...defaultSuggestionOptions };
    const keys = Object.keys(keyMapOfSuggestionOptionsStrict) as (keyof SuggestionOptionsRO)[];
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
