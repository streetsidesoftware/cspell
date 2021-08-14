import { IterableLike } from '../util/IterableLike';
import { parseDictionaryLines, buildTrieFast } from 'cspell-trie-lib';
import { SpellingDictionaryFromTrie } from './SpellingDictionaryFromTrie';
import { SpellingDictionary, SpellingDictionaryOptions } from './SpellingDictionary';
import { SpellingDictionaryLoadError } from './SpellingDictionaryError';

export function createSpellingDictionary(
    wordList: string[] | IterableLike<string>,
    name: string,
    source: string,
    options?: SpellingDictionaryOptions
): SpellingDictionary {
    // console.log(`createSpellingDictionary ${name} ${source}`);
    const words = parseDictionaryLines(wordList);
    const trie = buildTrieFast(words);
    return new SpellingDictionaryFromTrie(trie, name, options, source);
}

export function createFailedToLoadDictionary(error: SpellingDictionaryLoadError): SpellingDictionary {
    const { options, uri: source } = error;
    const errors = [error];
    return {
        name: options.name,
        source,
        type: 'error',
        has: () => false,
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
