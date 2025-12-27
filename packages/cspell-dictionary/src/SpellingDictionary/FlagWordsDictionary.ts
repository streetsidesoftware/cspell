import type { CompoundWordsMethod, ITrie, SuggestionResult } from 'cspell-trie-lib';
import { parseDictionary } from 'cspell-trie-lib';

import { createAutoResolveWeakCache } from '../util/AutoResolve.js';
import * as Defaults from './defaults.js';
import type {
    FindResult,
    HasOptions,
    IgnoreCaseOption,
    SpellingDictionary,
    SpellingDictionaryOptions,
} from './SpellingDictionary.js';
import { defaultOptions } from './SpellingDictionary.js';
import { SpellingDictionaryFromTrie } from './SpellingDictionaryFromTrie.js';
import type { SuggestOptions } from './SuggestOptions.js';
import type { TyposDictionary } from './TyposDictionary.js';
import { createTyposDictionary } from './TyposDictionary.js';

class FlagWordsDictionaryTrie extends SpellingDictionaryFromTrie {
    readonly containsNoSuggestWords = false;
    readonly options: SpellingDictionaryOptions = {};
    constructor(
        trie: ITrie,
        readonly name: string,
        readonly source: string,
    ) {
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
        ignoreCase?: boolean,
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

class FlagWordsDictionary implements SpellingDictionary {
    readonly containsNoSuggestWords = false;
    readonly options: SpellingDictionaryOptions = {};
    readonly type = 'flag-words';
    constructor(
        readonly name: string,
        readonly source: string,
        private dictTypos: TyposDictionary,
        private dictTrie: FlagWordsDictionaryTrie | undefined,
    ) {}

    /**
     * A Forbidden word list does not "have" valid words.
     * Therefore it always returns false.
     * @param word - the word
     * @param options - options
     * @returns always false
     */
    has(word: string, options?: HasOptions): boolean {
        return this.dictTypos.has(word, options) || this.dictTrie?.has(word, options) || false;
    }

    /** A more detailed search for a word, might take longer than `has` */
    find(word: string, options?: HasOptions): FindResult | undefined {
        const findTypos = this.dictTypos.find(word, options);
        if (findTypos) return findTypos;
        const ignoreCase = options?.ignoreCase ?? Defaults.ignoreCase;
        if (this.dictTypos.isSuggestedWord(word, ignoreCase)) return undefined;
        return this.dictTrie?.find(word, options);
    }

    isForbidden(
        word: string,
        ignoreCaseAndAccents: IgnoreCaseOption = Defaults.isForbiddenIgnoreCaseAndAccents,
    ): boolean {
        const findResult = this.find(word, { ignoreCase: ignoreCaseAndAccents });
        return findResult?.forbidden || false;
    }

    isNoSuggestWord(word: string, options: HasOptions): boolean {
        return this.dictTrie?.isNoSuggestWord(word, options) || this.dictTypos.isNoSuggestWord(word, options);
    }

    suggest(word: string, suggestOptions: SuggestOptions = {}): SuggestionResult[] {
        return this.dictTypos.suggest(word, suggestOptions);
    }
    getPreferredSuggestions(word: string) {
        return this.dictTypos.getPreferredSuggestions(word);
    }
    genSuggestions(): void {
        return;
    }
    mapWord(word: string): string {
        return word;
    }
    get size() {
        return this.dictTypos.size + (this.dictTrie?.size || 0);
    }
    readonly isDictionaryCaseSensitive: boolean = true;
    getErrors?(): Error[] {
        return [];
    }
}

const createCache = createAutoResolveWeakCache<readonly string[], SpellingDictionary>();

/**
 * Create a dictionary where all words are to be forbidden.
 * @param wordList - list of words
 * @param name
 * @param source
 * @param options
 * @returns SpellingDictionary
 */
export function createFlagWordsDictionary(
    wordList: readonly string[],
    name: string,
    source: string,
): SpellingDictionary {
    return createCache.get(wordList, () => {
        const trie = parseDictionary(wordList, { stripCaseAndAccents: false, makeWordsForbidden: true });
        const trieDict = new FlagWordsDictionaryTrie(trie, name, source);
        if (!trie.hasPreferredSuggestions) return trieDict;
        const typosDict = createTyposDictionary(trie.getAllPreferredSuggestions(), name, source);
        if (!trie.hasForbiddenWords) return typosDict;
        return new FlagWordsDictionary(name, source, typosDict, trieDict);
    });
}
