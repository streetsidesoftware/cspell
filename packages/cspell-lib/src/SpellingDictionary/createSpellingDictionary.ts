import { IterableLike } from '../util/IterableLike';
import { parseDictionaryLines, buildTrieFast } from 'cspell-trie-lib';
import { SpellingDictionaryFromTrie } from './SpellingDictionaryFromTrie';
import { SpellingDictionary, SpellingDictionaryOptions } from './SpellingDictionary';
import { SpellingDictionaryLoadError } from './SpellingDictionaryError';
import { operators } from 'gensequence';
import { createWFromDictionaryInformation } from './SpellingDictionaryMethods';

const defaultOptions: SpellingDictionaryOptions = Object.freeze({
    weightMap: undefined,
});

export function createSpellingDictionary(
    wordList: string[] | IterableLike<string>,
    name: string,
    source: string,
    options: SpellingDictionaryOptions | undefined
): SpellingDictionary {
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
    wordList: string[],
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
