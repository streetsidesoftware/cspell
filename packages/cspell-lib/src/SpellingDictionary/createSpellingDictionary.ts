import { buildTrieFast, parseDictionaryLines } from 'cspell-trie-lib';
import { deepEqual } from 'fast-equals';
import { operators } from 'gensequence';
import { IterableLike } from '../util/IterableLike';
import { AutoWeakCache, SimpleCache } from '../util/simpleCache';
import { SpellingDictionary, SpellingDictionaryOptions } from './SpellingDictionary';
import { SpellingDictionaryLoadError } from './SpellingDictionaryError';
import { SpellingDictionaryFromTrie } from './SpellingDictionaryFromTrie';
import { createWeightMapFromDictionaryInformation } from './SpellingDictionaryMethods';

const defaultOptions: SpellingDictionaryOptions = Object.freeze({
    weightMap: undefined,
});

type CreateSpellingDictionaryParams = Parameters<typeof createSpellingDictionary>;

const cachedDictionaries = new AutoWeakCache<CreateSpellingDictionaryParams, SpellingDictionary>(
    _createSpellingDictionary,
    64
);

const maxSetSize = 3;
const cachedParamsByWordList = new SimpleCache<string, Set<CreateSpellingDictionaryParams>>(64);

export function createSpellingDictionary(
    wordList: readonly string[] | IterableLike<string>,
    name: string,
    source: string,
    options: SpellingDictionaryOptions | undefined
): SpellingDictionary {
    const params: CreateSpellingDictionaryParams = [wordList, name, source, options];

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
    const trie = buildTrieFast(words);
    const opts = { ...(options || defaultOptions) };
    if (opts.weightMap === undefined && opts.dictionaryInformation) {
        opts.weightMap = createWeightMapFromDictionaryInformation(opts.dictionaryInformation);
    }
    return new SpellingDictionaryFromTrie(trie, name, opts, source);
}

export function createForbiddenWordsDictionary(
    wordList: readonly string[],
    name: string,
    source: string,
    options: SpellingDictionaryOptions | undefined
): SpellingDictionary {
    // console.log(`createSpellingDictionary ${name} ${source}`);
    const words = parseDictionaryLines(wordList.concat(wordList.map((a) => a.toLowerCase())), {
        stripCaseAndAccents: !options?.noSuggest,
    });
    const forbidWords = operators.map((w: string) => '!' + w)(words);
    const trie = buildTrieFast(forbidWords);
    return new SpellingDictionaryFromTrie(trie, name, options || defaultOptions, source);
}

export function createFailedToLoadDictionary(error: SpellingDictionaryLoadError): SpellingDictionary {
    const { options, uri: source } = error;
    const errors = [error];
    return {
        name: options.name,
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
        getErrors: () => errors,
    };
}
