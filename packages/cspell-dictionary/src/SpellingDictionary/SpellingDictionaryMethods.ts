import type { DictionaryInformation } from '@cspell/cspell-types';
import type { SuggestionResult, WeightMap } from 'cspell-trie-lib';
import { mapDictionaryInformationToWeightMap } from 'cspell-trie-lib';

import { isUpperCase, lcRest, removeUnboundAccents, ucFirst } from '../util/text.js';
import type { HasOptions, SearchOptions } from './SpellingDictionary.js';

export { impersonateCollector, suggestionCollector } from 'cspell-trie-lib';

export type FilterSuggestionsPredicate = (word: SuggestionResult) => boolean;

export const defaultNumSuggestions = 10;

function wordSearchFormsArray(
    word: string,
    isDictionaryCaseSensitive: boolean,
    ignoreCase: boolean,
    locale?: string,
): string[] {
    return [...wordSearchForms(word, isDictionaryCaseSensitive, ignoreCase, locale)];
}

/**
 * The forms of a word to look up in a dictionary.
 * @param word - the word as written.
 * @param isDictionaryCaseSensitive - the dictionary contains words with capitals.
 * @param ignoreCase - case doesn't matter for the check.
 * @param locale - the dictionary's locale. Case changes follow its rules.
 */
export function wordSearchForms(
    word: string,
    isDictionaryCaseSensitive: boolean,
    ignoreCase: boolean,
    locale?: string,
): Set<string> {
    const forms = new Set<string>();
    word = word.normalize('NFC');
    const wordLc = word.toLowerCase();
    const wordLcLocale = locale ? word.toLocaleLowerCase(locale) : wordLc;
    if (ignoreCase) {
        addLowerCaseForms(forms, wordLcLocale, isDictionaryCaseSensitive);
        // Dictionaries store their case-insensitive forms with the default rules, so try those too.
        addLowerCaseForms(forms, wordLc, isDictionaryCaseSensitive);
    } else {
        if (isDictionaryCaseSensitive) {
            forms.add(word);
            forms.add(wordLcLocale);
            // HOUSE -> House, house
            if (isUpperCase(word)) {
                forms.add(locale ? lcRest(word, locale) : ucFirst(wordLc));
            }
        } else {
            addLowerCaseForms(forms, wordLcLocale, false);
        }
    }
    return forms;
}

function addLowerCaseForms(forms: Set<string>, wordLc: string, isDictionaryCaseSensitive: boolean): void {
    forms.add(wordLc);
    if (!isDictionaryCaseSensitive) {
        // Legacy remove any unbound accents
        forms.add(removeUnboundAccents(wordLc));
    }
}

export function wordSuggestFormsArray(word: string): string[] {
    return [...wordSuggestForms(word)];
}

export function wordSuggestForms(word: string): Set<string> {
    word = word.normalize('NFC');
    const forms = new Set<string>([word]);
    const wordLc = word.toLowerCase();
    forms.add(wordLc);
    return forms;
}

const DEFAULT_HAS_OPTIONS: HasOptions = Object.freeze({});

export function hasOptionToSearchOption(opt: HasOptions | undefined): SearchOptions {
    return canonicalSearchOptions(!opt ? DEFAULT_HAS_OPTIONS : opt);
}

const canonicalSearchOptionsMap = new Map<
    SearchOptions['ignoreCase'],
    Map<SearchOptions['useCompounds'], SearchOptions>
>();
const knownCanonicalOptions = new WeakMap<SearchOptions, SearchOptions>();

/**
 * Find the canonical form for SearchOptions. Useful Maps and WeakMaps.
 * @param opt - options to normalize
 * @returns SearchOptions - the canonical form
 */
export function canonicalSearchOptions(opt: SearchOptions): SearchOptions {
    const known = knownCanonicalOptions.get(opt);
    if (known) return known;
    const { ignoreCase, useCompounds } = opt;
    const foundLevel1Map = canonicalSearchOptionsMap.get(ignoreCase);
    const useLevel1Map = foundLevel1Map || new Map();
    if (!foundLevel1Map) {
        canonicalSearchOptionsMap.set(ignoreCase, useLevel1Map);
    }
    const foundCanOpts = useLevel1Map.get(useCompounds);
    const canOpts = foundCanOpts || Object.freeze({ ignoreCase, useCompounds });
    if (!foundCanOpts) {
        useLevel1Map.set(useCompounds, canOpts);
    }
    knownCanonicalOptions.set(opt, canOpts);
    return canOpts;
}

export function createWeightMapFromDictionaryInformation(di: undefined): undefined;
export function createWeightMapFromDictionaryInformation(di: DictionaryInformation): WeightMap;
export function createWeightMapFromDictionaryInformation(di: DictionaryInformation | undefined): WeightMap | undefined;
export function createWeightMapFromDictionaryInformation(di: DictionaryInformation | undefined): WeightMap | undefined {
    return di ? mapDictionaryInformationToWeightMap(di) : undefined;
}

export const __testMethods__: {
    wordSearchForms: typeof wordSearchForms;
    wordSearchFormsArray: typeof wordSearchFormsArray;
} = {
    wordSearchForms,
    wordSearchFormsArray,
};
