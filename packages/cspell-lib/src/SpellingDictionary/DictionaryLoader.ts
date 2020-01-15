import { splitLineIntoWords, splitLineIntoCodeWords, loadWordsNoError } from '../wordListHelper';
import { createSpellingDictionaryTrie } from './SpellingDictionaryFromTrie';
import { createSpellingDictionary } from './createSpellingDictionary';
import { SpellingDictionary } from './SpellingDictionary';
import * as path from 'path';
import { ReplaceMap } from '../Settings';
import { genSequence } from 'gensequence';
import { readLines } from '../util/fileReader';

export interface LoadOptions {
    // Type of file:
    //  S - single word per line,
    //  W - each line can contain one or more word separated by space,
    //  C - each line is treated like code (Camel Case is allowed)
    // Default is C
    // C is the slowest to load due to the need to split each line based upon code splitting rules.
    type?: LoaderType;
    // Replacement Map
    repMap?: ReplaceMap;
    // Use Compounds
    useCompounds?: boolean;
}

export type LoaderType = keyof Loaders;
export type Loader = (filename: string, options: LoadOptions) => Promise<SpellingDictionary>;

export interface Loaders {
    S: Loader;
    W: Loader;
    C: Loader;
    T: Loader;
    default: Loader;
    [index: string]: Loader | undefined;
}

const loaders: Loaders = {
    S: loadSimpleWordList,
    W: loadWordList,
    C: loadCodeWordList,
    T: loadTrie,
    default: loadSimpleWordList,
};

const dictionaryCache = new Map<string, Promise<SpellingDictionary>>();

export function loadDictionary(uri: string, options: LoadOptions): Promise<SpellingDictionary> {
    const loaderType = determineType(uri, options);
    const key = [uri, loaderType].join('|');
    if (!dictionaryCache.has(key)) {
        dictionaryCache.set(key, load(uri, options));
    }

    return dictionaryCache.get(key)!;
}


function determineType(uri: string, options: LoadOptions): LoaderType {
    const defType = uri.endsWith('.trie.gz') ? 'T' : uri.endsWith('.txt.gz') ? 'S' : 'C';
    const { type = defType } = options;
    const regTrieTest = /\.trie\b/i;
    return regTrieTest.test(uri) ? 'T' : type;
}

function load(uri: string, options: LoadOptions): Promise<SpellingDictionary>  {
    const type = determineType(uri, options);
    const loader = loaders[type] || loaders.default;
    return loader(uri, options);
}


async function loadSimpleWordList(filename: string, options: LoadOptions) {
    try {
        const lines = await readLines(filename);
        return createSpellingDictionary(lines, path.basename(filename), filename, options);
    } catch (e) {
        return Promise.reject(e);
    }
}

async function loadWordList(filename: string, options: LoadOptions) {
    const lines = genSequence(await readLines(filename));
    const words = lines.concatMap(splitLineIntoWords);
    return createSpellingDictionary(words, path.basename(filename), filename, options);
}

async function loadCodeWordList(filename: string, options: LoadOptions) {
    const lines = genSequence(await readLines(filename));
    const words = lines.concatMap(splitLineIntoCodeWords);
    return createSpellingDictionary(words, path.basename(filename), filename, options);
}

async function loadTrie(filename: string, options: LoadOptions) {
    return createSpellingDictionaryTrie(await loadWordsNoError(filename), path.basename(filename), filename, options);
}
