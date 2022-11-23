import { opMap, pipe } from '@cspell/cspell-pipe/sync';
import { buildTrieFast, CompoundWordsMethod, parseDictionaryLines, SuggestionResult, Trie } from 'cspell-trie-lib';
import { defaultOptions } from './createSpellingDictionary';
import {
    FindResult,
    HasOptions,
    SpellingDictionary,
    SpellingDictionaryOptions,
    SuggestOptions,
} from './SpellingDictionary';
import { createCollection } from './SpellingDictionaryCollection';
import { SpellingDictionaryFromTrie } from './SpellingDictionaryFromTrie';
import { createTyposDictionary } from './TyposDictionary';

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

    const { t: specialWords, f: typoWords } = bisect(
        parseDictionaryLines(wordList, { stripCaseAndAccents: false }),
        (line) => testSpecialCharacters.test(line)
    );

    const trieDict = specialWords.size ? buildTrieDict(specialWords, name, source) : undefined;
    const typosDict = createTyposDictionary(typoWords, name, source);

    if (!trieDict) return typosDict;

    return createCollection([typosDict, trieDict], name);
}

const regExpCleanIgnore = /^(!!)+/;

function buildTrieDict(words: Set<string>, name: string, source: string): ForbiddenWordsDictionaryTrie {
    const trie = buildTrieFast(
        pipe(
            words,
            opMap((w) => '!' + w),
            opMap((w) => w.replace(regExpCleanIgnore, ''))
        )
    );
    return new ForbiddenWordsDictionaryTrie(trie, name, source);
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
