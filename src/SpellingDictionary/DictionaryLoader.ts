import {
    loadWordsRx,
    splitLineIntoWordsRx, splitLineIntoCodeWordsRx
} from '../wordListHelper';
import { SpellingDictionary, createSpellingDictionaryRx, createSpellingDictionaryTrie } from './SpellingDictionary';
import * as path from 'path';

export interface LoadOptions {
    // Type of file:
    //  S - single word per line,
    //  W - each line can contain one or more word separated by space,
    //  C - each line is treated like code (Camel Case is allowed)
    // Default is C
    // C is the slowest to load due to the need to split each line based upon code splitting rules.
    type?: keyof Loaders;
}

export interface Loaders {
    S: (filename: string) => Promise<SpellingDictionary>;
    W: (filename: string) => Promise<SpellingDictionary>;
    C: (filename: string) => Promise<SpellingDictionary>;
    T: (filename: string) => Promise<SpellingDictionary>;
}

const loaders: Loaders = {
    S: loadSimpleWordList,
    W: loadWordList,
    C: loadCodeWordList,
    T: loadTrie,
};

const dictionaryCache = new Map<string, Promise<SpellingDictionary>>();

export function loadDictionary(uri: string, options: LoadOptions): Promise<SpellingDictionary> {
    const { type = 'C' } = options;
    const key = [uri, type].join('|');
    if (!dictionaryCache.has(key)) {
        dictionaryCache.set(key, load(uri, type));
    }

    return dictionaryCache.get(key)!;
}


function load(uri: string, type: string): Promise<SpellingDictionary>  {
    const regTrieTest = /\.trie\b/i;
    type = regTrieTest.test(uri) ? 'T' : type;
    const loader = loaders[type];
    return loader(uri);
}


function loadSimpleWordList(filename: string) {
    return createSpellingDictionaryRx(loadWordsRx(filename), path.basename(filename));
}

function loadWordList(filename: string) {
    return createSpellingDictionaryRx(loadWordsRx(filename).flatMap(splitLineIntoWordsRx), path.basename(filename));
}

function loadCodeWordList(filename: string) {
    return createSpellingDictionaryRx(loadWordsRx(filename).flatMap(splitLineIntoCodeWordsRx), path.basename(filename));
}

function loadTrie(filename: string) {
    return createSpellingDictionaryTrie(loadWordsRx(filename), path.basename(filename));
}
