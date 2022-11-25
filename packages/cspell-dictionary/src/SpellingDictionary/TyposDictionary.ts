import { opAppend, pipe } from '@cspell/cspell-pipe/sync';
import { CompoundWordsMethod, SuggestionCollector, SuggestionResult } from 'cspell-trie-lib';
import { mapperRemoveCaseAndAccents } from '../util/textMappers';
import * as defaults from './defaults';
import {
    FindResult,
    HasOptions,
    IgnoreCaseOption,
    SearchOptions,
    SpellingDictionary,
    SpellingDictionaryOptions,
    SuggestOptions,
} from './SpellingDictionary';
import { processEntriesToTyposDef, type TypoEntry, type TyposDef } from './Typos';
import { extractAllSuggestions, extractIgnoreValues } from './Typos/util';

interface Found {
    found: string;
    ignore: boolean;
}

export interface TyposDictionary extends SpellingDictionary {
    isForbidden(word: string, ignoreCaseAndAccents?: IgnoreCaseOption): boolean;
    /**
     * Determine if the word can appear in a list of suggestions.
     * @param word - word
     * @param ignoreCaseAndAccents - ignore case.
     * @returns true if a word is suggested, otherwise false.
     */
    isSuggestedWord(word: string, ignoreCaseAndAccents?: IgnoreCaseOption): boolean;
}

class TyposDictionaryImpl implements TyposDictionary {
    readonly containsNoSuggestWords: boolean;
    readonly options: SpellingDictionaryOptions = {};
    readonly type = 'typos';
    readonly size: number;
    private ignoreWords: Set<string>;
    /**
     * Note: ignoreWordsLower is only suggestions with the case and accents removed.
     * The logic is that if someone explicity ignored an upper case version, it does not
     * mean that the lower case version is ok.
     */
    private suggestions: Set<string>;
    private suggestionsLower: Set<string>;
    private explicitIgnoreWords: Set<string>;
    constructor(
        readonly name: string,
        readonly source: string,
        readonly typosDef: TyposDef,
        ignoreList?: Iterable<string>
    ) {
        this.size = Object.keys(typosDef).length;
        this.explicitIgnoreWords = extractIgnoreValues(typosDef, '!');
        this.suggestions = extractAllSuggestions(typosDef);
        this.ignoreWords = new Set(pipe(this.explicitIgnoreWords, opAppend(ignoreList || [])));
        this.suggestionsLower = new Set(pipe(this.suggestions, mapperRemoveCaseAndAccents));
        this.containsNoSuggestWords = this.ignoreWords.size > 0;
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
    find(word: string, options?: SearchOptions): FindResult | undefined {
        const result = this._findForms(word, options?.ignoreCase ?? defaults.ignoreCase);
        if (result === false) return undefined;
        const { found, ignore } = result;
        return { found, forbidden: !ignore, noSuggest: ignore };
    }

    private _findForms(word: string, ignoreCaseAndAccents: boolean): Found | false {
        const lcWord = word.toLowerCase();
        if (this.ignoreWords.has(word)) {
            return { found: word, ignore: true };
        }
        if (this.suggestions.has(word)) {
            return false;
        }
        if (ignoreCaseAndAccents) {
            if (this.suggestionsLower.has(lcWord)) {
                return false;
            }
            if (this.ignoreWords.has(lcWord)) {
                return { found: lcWord, ignore: true };
            }
        }
        if (word in this.typosDef) return { found: word, ignore: false };
        if (lcWord in this.typosDef) return { found: lcWord, ignore: false };
        return false;
    }

    isForbidden(
        word: string,
        ignoreCaseAndAccents: IgnoreCaseOption = defaults.isForbiddenIgnoreCaseAndAccents
    ): boolean {
        const found = this._findForms(word, ignoreCaseAndAccents);
        return found !== false && !found.ignore;
    }

    isNoSuggestWord(word: string, options: HasOptions): boolean {
        const result = this.find(word, options);
        return result?.noSuggest ?? false;
    }

    /**
     * Determine if the word can appear in a list of suggestions.
     * @param word - word
     * @param ignoreCaseAndAccents - ignore case.
     * @returns true if a word is suggested, otherwise false.
     */
    isSuggestedWord(
        word: string,
        ignoreCaseAndAccents: IgnoreCaseOption = defaults.isForbiddenIgnoreCaseAndAccents
    ): boolean {
        if (this.suggestions.has(word)) return true;
        const lcWord = word.toLowerCase();
        return ignoreCaseAndAccents && (this.suggestions.has(lcWord) || this.suggestionsLower.has(lcWord));
    }

    suggest(
        word: string,
        numSuggestions?: number,
        compoundMethod?: CompoundWordsMethod,
        numChanges?: number,
        ignoreCase?: boolean
    ): SuggestionResult[];
    suggest(word: string, suggestOptions: SuggestOptions): SuggestionResult[];
    public suggest(word: string): SuggestionResult[] {
        return this._suggest(word) || this._suggest(word.toLowerCase()) || [];
    }

    private _suggest(word: string): SuggestionResult[] | undefined {
        if (this.ignoreWords.has(word)) return [];
        if (!(word in this.typosDef)) return undefined;
        const sug = this.typosDef[word];
        if (!sug) return [];
        if (typeof sug === 'string') {
            return [
                {
                    word: sug,
                    cost: 1,
                    isPreferred: true,
                },
            ];
        }
        return sug.map((word, index) => ({ word, cost: index + 1 }));
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

/**
 * Create a dictionary where all words are to be forbidden.
 * @param entries - list of Typos Entries
 * @param name - name of dictionary
 * @param source - source
 * @returns
 */
export function createTyposDictionary(
    entries: readonly string[] | TyposDef | Iterable<TypoEntry>,
    name: string,
    source: string
): TyposDictionary {
    const def = processEntriesToTyposDef(entries);
    return new TyposDictionaryImpl(name, source, def);
}
