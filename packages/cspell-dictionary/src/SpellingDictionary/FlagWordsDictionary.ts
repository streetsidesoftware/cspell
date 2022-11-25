import { opMap, pipe } from '@cspell/cspell-pipe/sync';
import { buildTrieFast, CompoundWordsMethod, parseDictionaryLines, SuggestionResult, Trie } from 'cspell-trie-lib';
import { defaultOptions } from './createSpellingDictionary';
import * as Defaults from './defaults';
import {
    FindResult,
    HasOptions,
    IgnoreCaseOption,
    SpellingDictionary,
    SpellingDictionaryOptions,
    SuggestArgs,
    SuggestOptions,
} from './SpellingDictionary';
import { SpellingDictionaryFromTrie } from './SpellingDictionaryFromTrie';
import { suggestArgsToSuggestOptions } from './SpellingDictionaryMethods';
import { createTyposDictionary, TyposDictionary } from './TyposDictionary';

class FlagWordsDictionaryTrie extends SpellingDictionaryFromTrie {
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

class FlagWordsDictionary implements SpellingDictionary {
    readonly containsNoSuggestWords = false;
    readonly options: SpellingDictionaryOptions = {};
    readonly type = 'flag-words';
    constructor(
        readonly name: string,
        readonly source: string,
        private dictTypos: TyposDictionary,
        private dictTrie: FlagWordsDictionaryTrie | undefined
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
        ignoreCaseAndAccents: IgnoreCaseOption = Defaults.isForbiddenIgnoreCaseAndAccents
    ): boolean {
        const findResult = this.find(word, { ignoreCase: ignoreCaseAndAccents });
        return findResult?.forbidden || false;
    }

    isNoSuggestWord(word: string, options: HasOptions): boolean {
        return this.dictTrie?.isNoSuggestWord(word, options) || this.dictTypos.isNoSuggestWord(word, options);
    }

    suggest(
        word: string,
        numSuggestions?: number,
        compoundMethod?: CompoundWordsMethod,
        numChanges?: number,
        ignoreCase?: boolean
    ): SuggestionResult[];
    suggest(word: string, suggestOptions: SuggestOptions): SuggestionResult[];
    suggest(...args: SuggestArgs) {
        const [word] = args;
        const suggestOptions = suggestArgsToSuggestOptions(args);
        return this.dictTypos.suggest(word, suggestOptions);
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
    source: string
): SpellingDictionary {
    const testSpecialCharacters = /[~*+]/;

    const { t: specialWords, f: typoWords } = bisect(
        parseDictionaryLines(wordList, { stripCaseAndAccents: false }),
        (line) => testSpecialCharacters.test(line)
    );

    const trieDict = specialWords.size ? buildTrieDict(specialWords, name, source) : undefined;
    const typosDict = createTyposDictionary(typoWords, name, source);

    if (!trieDict) return typosDict;

    return new FlagWordsDictionary(name, source, typosDict, trieDict);
}

const regExpCleanIgnore = /^(!!)+/;

function buildTrieDict(words: Set<string>, name: string, source: string): FlagWordsDictionaryTrie {
    const trie = buildTrieFast(
        pipe(
            words,
            opMap((w) => '!' + w),
            opMap((w) => w.replace(regExpCleanIgnore, ''))
        )
    );
    return new FlagWordsDictionaryTrie(trie, name, source);
}

function bisect<T>(values: Set<T> | Iterable<T>, predicate: (v: T) => boolean): { t: Set<T>; f: Set<T> } {
    const t = new Set<T>();
    const f = new Set<T>();
    for (const v of values) {
        if (predicate(v)) {
            t.add(v);
        } else {
            f.add(v);
        }
    }
    return { t, f };
}
