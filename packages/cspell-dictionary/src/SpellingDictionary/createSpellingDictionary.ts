import { fileURLToPath } from 'node:url';

import { buildITrieFromWords, parseDictionaryLines } from 'cspell-trie-lib';
import { deepEqual } from 'fast-equals';

import type { IterableLike } from '../util/IterableLike.js';
import { AutoWeakCache, SimpleCache } from '../util/simpleCache.js';
import type { DictionaryInfo, SpellingDictionary, SpellingDictionaryOptions } from './SpellingDictionary.js';
import { defaultOptions } from './SpellingDictionary.js';
import { SpellingDictionaryFromTrie } from './SpellingDictionaryFromTrie.js';
import { createWeightMapFromDictionaryInformation } from './SpellingDictionaryMethods.js';

type CreateSpellingDictionaryParams = Parameters<typeof createSpellingDictionary>;

const cachedDictionaries = new AutoWeakCache<CreateSpellingDictionaryParams, SpellingDictionary>(
    _createSpellingDictionary,
    64,
);

const maxSetSize = 3;
const cachedParamsByWordList = new SimpleCache<string, Set<CreateSpellingDictionaryParams>>(64);

/**
 * Create a SpellingDictionary
 * @param wordList - list of words
 * @param name - name of dictionary
 * @param source - filename or uri
 * @param options - dictionary options
 * @returns a Spelling Dictionary
 */
export function createSpellingDictionary(
    wordList: readonly string[] | IterableLike<string>,
    name: string,
    source: string,
    options?: SpellingDictionaryOptions | undefined,
): SpellingDictionary {
    const params: CreateSpellingDictionaryParams = [wordList, name, source.toString(), options];

    if (!Array.isArray(wordList)) {
        return _createSpellingDictionary(params);
    }

    const cached = cachedParamsByWordList.get(name) || new Set<CreateSpellingDictionaryParams>();

    for (const cachedParams of cached) {
        if (deepEqual(params, cachedParams)) {
            return cachedDictionaries.get(cachedParams);
        }
    }

    if (cached.size > maxSetSize) cached.clear();
    cached.add(params);
    cachedParamsByWordList.set(name, cached);

    return cachedDictionaries.get(params);
}

function _createSpellingDictionary(params: CreateSpellingDictionaryParams): SpellingDictionary {
    const [wordList, name, source, options] = params;
    // console.log(`createSpellingDictionary ${name} ${source}`);
    const parseOptions = { stripCaseAndAccents: options?.supportNonStrictSearches ?? true };
    const words = parseDictionaryLines(wordList, parseOptions);
    const trie = buildITrieFromWords(words);
    const opts = { ...(options || defaultOptions) };
    if (opts.weightMap === undefined && opts.dictionaryInformation) {
        opts.weightMap = createWeightMapFromDictionaryInformation(opts.dictionaryInformation);
    }
    return new SpellingDictionaryFromTrie(trie, name, opts, source);
}

export interface SpellingDictionaryLoadError extends Error {
    /** The Error Name */
    readonly name: string;
    /** Possible Cause */
    readonly cause?: Error | undefined;
    /** Message to Display */
    readonly message: string;
    /** Dictionary Information */
    readonly info: DictionaryInfo;
}

export function createFailedToLoadDictionary(
    name: string,
    sourceUrl: URL | string,
    error: Error,
    options?: SpellingDictionaryOptions | undefined,
): SpellingDictionary {
    const sourceHref = typeof sourceUrl === 'string' ? sourceUrl : sourceUrl.href;
    const source = sourceHref.startsWith('file:') ? fileURLToPath(sourceUrl) : sourceHref;
    options = options || {};
    return {
        name,
        source,
        type: 'error',
        containsNoSuggestWords: false,
        has: () => false,
        find: () => undefined,
        isNoSuggestWord: () => false,
        isForbidden: () => false,
        suggest: () => [],
        mapWord: (a) => a,
        genSuggestions: () => {
            return;
        },
        size: 0,
        options,
        isDictionaryCaseSensitive: false,
        getErrors: () => [error],
    };
}
