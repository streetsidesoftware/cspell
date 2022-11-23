import { opAppend, pipe } from '@cspell/cspell-pipe/sync';
import { CompoundWordsMethod, SuggestionCollector, SuggestionResult } from 'cspell-trie-lib';
import { mapperRemoveCaseAndAccents } from '../util/textMappers';
import * as defaults from './defaults';
import {
    FindResult,
    HasOptions,
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

class TyposDictionary implements SpellingDictionary {
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
    private ignoreWordsLower: Set<string>;
    private explicitIgnoreWords: Set<string>;
    constructor(
        readonly name: string,
        readonly source: string,
        readonly typosDef: TyposDef,
        ignoreList?: Iterable<string>
    ) {
        this.size = Object.keys(typosDef).length;
        this.explicitIgnoreWords = extractIgnoreValues(typosDef, '!');
        const suggestions = extractAllSuggestions(typosDef);
        this.ignoreWords = new Set(pipe(this.explicitIgnoreWords, opAppend(suggestions), opAppend(ignoreList || [])));
        this.ignoreWordsLower = new Set(pipe(suggestions, mapperRemoveCaseAndAccents));
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
        if (this.ignoreWords.has(word)) {
            return { found: word, ignore: true };
        }
        const lcWord = word.toLowerCase();
        if (ignoreCaseAndAccents && (this.ignoreWords.has(lcWord) || this.ignoreWordsLower.has(lcWord))) {
            return { found: lcWord, ignore: true };
        }
        if (word in this.typosDef) return { found: word, ignore: false };
        if (lcWord in this.typosDef) return { found: lcWord, ignore: false };
        return false;
    }

    isForbidden(word: string, ignoreCaseAndAccents: boolean = defaults.isForbiddenIgnoreCaseAndAccents): boolean {
        const found = this._findForms(word, ignoreCaseAndAccents);
        return found !== false && !found.ignore;
    }

    isNoSuggestWord(word: string, options: HasOptions): boolean {
        const result = this.find(word, options);
        return result?.noSuggest ?? false;
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
): SpellingDictionary {
    return _createTyposDictionary(entries, name, source);
}

/**
 * Create a dictionary where all words are to be forbidden.
 * @param entries - list of Typos Entries
 * @param name - name of dictionary
 * @param source - source
 * @returns
 */
export function _createTyposDictionary(
    entries: readonly string[] | TyposDef | Iterable<TypoEntry>,
    name: string,
    source: string
): TyposDictionary {
    const def = processEntriesToTyposDef(entries);
    return new TyposDictionary(name, source, def);
}
