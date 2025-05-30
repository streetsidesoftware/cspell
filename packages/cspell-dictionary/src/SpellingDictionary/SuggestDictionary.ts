import { pipe } from '@cspell/cspell-pipe/sync';
import type { CompoundWordsMethod, SuggestionCollector, SuggestionResult } from 'cspell-trie-lib';

import { createAutoResolveWeakCache } from '../util/AutoResolve.js';
import { mapperRemoveCaseAndAccents } from '../util/textMappers.js';
import * as defaults from './defaults.js';
import type {
    FindResult,
    HasOptions,
    IgnoreCaseOption,
    PreferredSuggestion,
    SearchOptions,
    SpellingDictionary,
    SpellingDictionaryOptions,
} from './SpellingDictionary.js';
import type { SuggestOptions } from './SuggestOptions.js';
import { processEntriesToTyposDef, type TypoEntry, type TyposDef } from './Typos/index.js';
import { extractAllSuggestions } from './Typos/util.js';

export interface SuggestDictionary extends SpellingDictionary {
    getPreferredSuggestions: (word: string) => PreferredSuggestion[];
    /**
     * Determine if the word can appear in a list of suggestions.
     * @param word - word
     * @param ignoreCaseAndAccents - ignore case.
     * @returns true if a word is suggested, otherwise false.
     */
    isSuggestedWord(word: string, ignoreCaseAndAccents?: IgnoreCaseOption): boolean;
}

interface PreferredSuggestionResult extends SuggestionResult {
    isPreferred: true;
}

class SuggestDictionaryImpl implements SuggestDictionary {
    readonly containsNoSuggestWords: boolean = false;
    readonly options: SpellingDictionaryOptions = {};
    readonly type = 'suggest';
    readonly size: number;
    /**
     * Note: ignoreWordsLower is only suggestions with the case and accents removed.
     * The logic is that if someone explicity ignored an upper case version, it does not
     * mean that the lower case version is ok.
     */
    private suggestions: Set<string>;
    private suggestionsLower: Set<string>;
    constructor(
        readonly name: string,
        readonly source: string,
        readonly typosDef: TyposDef,
    ) {
        this.size = Object.keys(typosDef).length;
        this.suggestions = extractAllSuggestions(typosDef);
        this.suggestionsLower = new Set(pipe(this.suggestions, mapperRemoveCaseAndAccents));
    }

    /**
     * A Forbidden word list does not "have" valid words.
     * Therefore it always returns false.
     * @param _word - the word
     * @param _options - options
     * @returns always false
     */
    has(_word: string, _options?: HasOptions): boolean {
        return false;
    }

    /** A more detailed search for a word, might take longer than `has` */
    find(_word: string, _options?: SearchOptions): FindResult | undefined {
        return undefined;
    }

    isForbidden(_word: string, _ignoreCaseAndAccents?: IgnoreCaseOption): boolean {
        return false;
    }

    isNoSuggestWord(_word: string, _options: HasOptions): boolean {
        return false;
    }

    /**
     * Determine if the word can appear in a list of suggestions.
     * @param word - word
     * @param ignoreCaseAndAccents - ignore case.
     * @returns true if a word is suggested, otherwise false.
     */
    isSuggestedWord(
        word: string,
        ignoreCaseAndAccents: IgnoreCaseOption = defaults.isForbiddenIgnoreCaseAndAccents,
    ): boolean {
        if (this.suggestions.has(word)) return true;
        if (!ignoreCaseAndAccents) return false;
        const lcWord = word.toLowerCase();
        return this.suggestions.has(lcWord) || this.suggestionsLower.has(lcWord);
    }

    suggest(
        word: string,
        numSuggestions?: number,
        compoundMethod?: CompoundWordsMethod,
        numChanges?: number,
        ignoreCase?: boolean,
    ): SuggestionResult[];
    suggest(word: string, suggestOptions: SuggestOptions): SuggestionResult[];
    public suggest(word: string): SuggestionResult[] {
        return this.getPreferredSuggestions(word);
    }

    private _suggest(word: string): PreferredSuggestionResult[] | undefined {
        if (!(word in this.typosDef)) return undefined;
        const sug = this.typosDef[word];
        const isPreferred = true;
        if (!sug) return [];
        if (typeof sug === 'string') {
            return [
                {
                    word: sug,
                    cost: 1,
                    isPreferred,
                },
            ];
        }
        return sug.map((word, index) => ({ word, cost: index + 1, isPreferred }));
    }

    getPreferredSuggestions(word: string): PreferredSuggestionResult[] {
        return this._suggest(word) || this._suggest(word.toLowerCase()) || [];
    }

    genSuggestions(collector: SuggestionCollector): void {
        const sugs = this.suggest(collector.word);
        sugs.forEach((result) => collector.add(result));
    }

    mapWord(word: string): string {
        return word;
    }
    readonly isDictionaryCaseSensitive: boolean = true;
    getErrors?(): Error[] {
        return [];
    }
}

const createCache = createAutoResolveWeakCache<string[] | TyposDef | Iterable<TypoEntry>, SuggestDictionary>();

/**
 * Create a dictionary where all words are to be forbidden.
 * @param entries - list of Typos Entries
 * @param name - name of dictionary
 * @param source - source
 * @returns
 */
export function createSuggestDictionary(
    entries: readonly string[] | TyposDef | Iterable<TypoEntry>,
    name: string,
    source: string,
): SuggestDictionary {
    return createCache.get(entries, () => {
        const def = processEntriesToTyposDef(entries);
        return new SuggestDictionaryImpl(name, source, def);
    });
}
