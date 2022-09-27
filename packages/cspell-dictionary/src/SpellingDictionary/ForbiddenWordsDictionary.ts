import { buildTrieFast, CompoundWordsMethod, parseDictionaryLines, SuggestionResult, Trie } from 'cspell-trie-lib';
import { defaultOptions } from './createSpellingDictionary';
import {
    SpellingDictionary,
    SpellingDictionaryOptions,
    HasOptions,
    SuggestOptions,
    FindResult,
    SearchOptions,
} from './SpellingDictionary';
import { SpellingDictionaryFromTrie } from './SpellingDictionaryFromTrie';

class ForbiddenWordsDictionaryTrie extends SpellingDictionaryFromTrie {
    readonly containsNoSuggestWords = false;
    readonly options: SpellingDictionaryOptions = {};
    constructor(trie: Trie, readonly name: string, readonly source: string) {
        super(trie, name, defaultOptions, source);
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

    public find(word: string, hasOptions?: HasOptions): FindResult | undefined {
        const f = super.find(word, hasOptions);
        if (!f || !f.forbidden) return undefined;
        return f;
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
    readonly isDictionaryCaseSensitive: boolean = true;
}

class ForbiddenWordsDictionary implements SpellingDictionary {
    private dict: Set<string>;
    private dictIgnore: Set<string>;
    readonly containsNoSuggestWords = false;
    readonly options: SpellingDictionaryOptions = {};
    readonly type = 'forbidden';
    constructor(readonly name: string, readonly source: string, words: string[]) {
        this.dict = new Set(words);
        this.dictIgnore = new Set(words.filter((w) => w.startsWith('!')).map((w) => w.slice(1)));
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
    find(word: string, _options?: SearchOptions): FindResult | undefined {
        const forbidden = this.isForbidden(word);
        return forbidden ? { found: word, forbidden, noSuggest: false } : undefined;
    }

    isForbidden(word: string): boolean {
        return (this.dict.has(word) || this.dict.has(word.toLowerCase())) && !this.dictIgnore.has(word);
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
    const testSpecialCharacters = /[~*+]/;
    const regExpCleanIgnore = /^(!!)+/;

    const words = [...parseDictionaryLines(wordList, { stripCaseAndAccents: false })];

    const hasSpecial = words.findIndex((word) => testSpecialCharacters.test(word)) >= 0;

    if (hasSpecial) {
        const trie = buildTrieFast(words.map((w) => '!' + w).map((w) => w.replace(regExpCleanIgnore, '')));
        return new ForbiddenWordsDictionaryTrie(trie, name, source);
    }

    return new ForbiddenWordsDictionary(name, source, words);
}
