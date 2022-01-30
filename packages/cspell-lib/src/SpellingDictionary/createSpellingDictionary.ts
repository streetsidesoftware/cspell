import { buildTrieFast, parseDictionaryLines } from 'cspell-trie-lib';
import { deepEqual } from 'fast-equals';
import { operators } from 'gensequence';
import { IterableLike } from '../util/IterableLike';
import { AutoWeakCache, SimpleWeakCache } from '../util/simpleCache';
import { SpellingDictionary, SpellingDictionaryOptions } from './SpellingDictionary';
import { SpellingDictionaryLoadError } from './SpellingDictionaryError';
import { SpellingDictionaryFromTrie } from './SpellingDictionaryFromTrie';
import { createWFromDictionaryInformation } from './SpellingDictionaryMethods';

const defaultOptions: SpellingDictionaryOptions = Object.freeze({
    weightMap: undefined,
});

type CreateSpellingDictionaryParams = Parameters<typeof createSpellingDictionary>;

const cachedDictionaries = new AutoWeakCache<CreateSpellingDictionaryParams, SpellingDictionary>(
    _createSpellingDictionary,
    64
);

type WordList = string[] | IterableLike<string>;

const cachedParamsByWordList = new SimpleWeakCache<WordList, CreateSpellingDictionaryParams[]>(64);

export function createSpellingDictionary(
    wordList: readonly string[] | IterableLike<string>,
    name: string,
    source: string,
    options: SpellingDictionaryOptions | undefined
): SpellingDictionary {
    const params: CreateSpellingDictionaryParams = [wordList, name, source, options];

    const cached = cachedParamsByWordList.get(wordList) || [];

    for (const cachedParams of cached) {
        if (deepEqual(params, cachedParams)) {
            return cachedDictionaries.get(cachedParams);
        }
    }

    // const msg = `Cache miss ${name} ${source} ${Array.isArray(wordList) ? 'Array' : 'Iterable'}`;
    // const e = new Error(msg);
    // console.log(e);

    cached.push(params);
    cachedParamsByWordList.set(wordList, cached);

    // console.log(`createSpellingDictionary ${name} ${source}`);
    return cachedDictionaries.get(params);
}

function _createSpellingDictionary(params: CreateSpellingDictionaryParams): SpellingDictionary {
    const [wordList, name, source, options] = params;
    // console.log(`createSpellingDictionary ${name} ${source}`);
    const words = parseDictionaryLines(wordList);
    const trie = buildTrieFast(words);
    const opts = { ...(options || defaultOptions) };
    if (opts.weightMap === undefined && opts.dictionaryInformation) {
        opts.weightMap = createWFromDictionaryInformation(opts.dictionaryInformation);
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
