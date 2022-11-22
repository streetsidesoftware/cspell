import { opFilter, opMap, pipe } from '@cspell/cspell-pipe/sync';
import { CompoundWordsMethod, parseDictionaryLines, SuggestionResult } from 'cspell-trie-lib';
import {
    FindResult,
    HasOptions,
    SearchOptions,
    SpellingDictionary,
    SpellingDictionaryOptions,
    SuggestOptions,
} from './SpellingDictionary';
import * as Defaults from './defaults';
import { createSpellingDictionary } from './createSpellingDictionary';

const NormalizeForm = 'NFC' as const;

class IgnoreWordsDictionary implements SpellingDictionary {
    private dict: Set<string>;
    private dictNonStrict: Set<string>;
    readonly containsNoSuggestWords = true;
    readonly options: SpellingDictionaryOptions = {};
    readonly type = 'ignore';
    constructor(readonly name: string, readonly source: string, words: Iterable<string>) {
        this.dict = new Set(words);
        this.dictNonStrict = new Set(
            pipe(
                this.dict,
                opFilter((w) => w.startsWith('~')),
                opMap((w) => w.slice(1))
            )
        );
    }

    /**
     * A Forbidden word list does not "have" valid words.
     * Therefore it always returns false.
     * @param _word - the word
     * @param _options - options
     * @returns always false
     */
    has(word: string, options?: HasOptions): boolean {
        const nWord = word.normalize(NormalizeForm);
        if (this.dict.has(nWord)) return true;
        const lcWord = nWord.toLowerCase();
        if (this.dict.has(lcWord)) return true;
        const ignoreCase = options?.ignoreCase ?? Defaults.ignoreCase;
        return ignoreCase && (this.dictNonStrict.has(nWord) || this.dictNonStrict.has(lcWord));
    }

    /** A more detailed search for a word, might take longer than `has` */
    find(word: string, options?: SearchOptions): FindResult | undefined {
        const nWord = word.normalize(NormalizeForm);
        if (this.dict.has(nWord)) return { found: nWord, forbidden: false, noSuggest: true };
        const lcWord = nWord.toLowerCase();
        if (this.dict.has(lcWord)) return { found: lcWord, forbidden: false, noSuggest: true };

        const ignoreCase = options?.ignoreCase ?? Defaults.ignoreCase;
        if (!ignoreCase) return undefined;

        if (this.dictNonStrict.has(nWord)) return { found: nWord, forbidden: false, noSuggest: true };
        return (this.dictNonStrict.has(lcWord) && { found: lcWord, forbidden: false, noSuggest: true }) || undefined;
    }

    isForbidden(_word: string): boolean {
        return false;
    }

    isNoSuggestWord(word: string, options: HasOptions): boolean {
        return this.has(word, options);
    }

    suggest(
        word: string,
        numSuggestions?: number,
        compoundMethod?: CompoundWordsMethod,
        numChanges?: number,
        ignoreCase?: boolean
    ): SuggestionResult[];
    suggest(word: string, suggestOptions: SuggestOptions): SuggestionResult[];
    suggest() {
        return [];
    }
    genSuggestions(): void {
        return;
    }
    mapWord(word: string): string {
        return word;
    }
    get size() {
        return this.dict.size;
    }
    readonly isDictionaryCaseSensitive: boolean = true;
    getErrors?(): Error[] {
        return [];
    }
}

/**
 * Create a dictionary where all words are to be ignored.
 * Ignored words override forbidden words.
 * @param wordList - list of words
 * @param name - name of dictionary
 * @param source - dictionary source
 * @returns
 */
export function createIgnoreWordsDictionary(
    wordList: readonly string[],
    name: string,
    source: string
): SpellingDictionary {
    const testSpecialCharacters = /[*+]/;

    const words = [...parseDictionaryLines(wordList, { stripCaseAndAccents: true })].map((w) =>
        w.normalize(NormalizeForm)
    );

    const hasSpecial = words.findIndex((word) => testSpecialCharacters.test(word)) >= 0;

    if (hasSpecial) {
        return createSpellingDictionary(words, name, source, {
            caseSensitive: true,
            noSuggest: true,
            weightMap: undefined,
            supportNonStrictSearches: true,
        });
    }

    return new IgnoreWordsDictionary(name, source, words);
}
