import { buildTrieFast, CompoundWordsMethod, parseDictionaryLines, SuggestionResult } from 'cspell-trie-lib';
import {
    SpellingDictionary,
    SpellingDictionaryOptions,
    HasOptions,
    SuggestOptions,
    FindResult,
    SearchOptions,
} from './SpellingDictionary';
import { SpellingDictionaryFromTrie } from './SpellingDictionaryFromTrie';
import { defaultOptions } from './createSpellingDictionary';

class ForbiddenWordsDictionary implements SpellingDictionary {
    private dict: SpellingDictionaryFromTrie;
    readonly containsNoSuggestWords = false;
    readonly options: SpellingDictionaryOptions = {};
    readonly type = 'forbidden';
    constructor(readonly name: string, readonly source: string, wordList: Iterable<string>) {
        const words = parseDictionaryLines(wordList, { stripCaseAndAccents: false });
        const trie = buildTrieFast(words);
        this.dict = new SpellingDictionaryFromTrie(trie, name, defaultOptions, source);
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
        const r = this.dict.find(word, options);
        if (!r || r.found === false || r.forbidden) return undefined;
        return { ...r, forbidden: true };
    }

    isForbidden(word: string): boolean {
        const r = this.find(word);
        if (!r) return false;
        return r.forbidden && r.found !== false;
    }

    isNoSuggestWord(_word: string, _options: HasOptions): boolean {
        return false;
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
 * Create a dictionary where all words are to be forbidden.
 * @param wordList - list of words
 * @param name
 * @param source
 * @param options
 * @returns
 */

export function createForbiddenWordsDictionary(
    wordList: readonly string[],
    name: string,
    source: string
): SpellingDictionary {
    return new ForbiddenWordsDictionary(name, source, wordList);
}
