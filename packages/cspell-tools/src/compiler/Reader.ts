import { pipe } from '@cspell/cspell-pipe/sync';
import { COMPOUND_FIX, FORBID_PREFIX, importTrie, Trie } from 'cspell-trie-lib';
import type { AffWord } from 'hunspell-reader';
import * as HR from 'hunspell-reader';

import { readTextFile, readTextFileLines } from './readTextFile';
import { parseFileLines } from './wordListParser';

const regHunspellFile = /\.(dic|aff)$/i;

export interface ReaderOptions {
    /**
     * Max Hunspell recursive depth.
     */
    maxDepth?: number;
    /**
     * split words if necessary.
     */
    splitWords: boolean;
    /**
     * Indicate that it is an unformatted file and needs to be cleaned
     * before processing. Applies only to text file sources.
     * @default false
     */
    legacy?: boolean;

    keepCase?: boolean;
}

type ReaderFn = (filename: string, options: ReaderOptions) => Promise<BaseReader>;

// cspell:word dedupe
const DEDUPE_SIZE = 1000;

interface ReaderSelector {
    test: RegExp;
    method: ReaderFn;
}

export type AnnotatedWord = string;

interface BaseReader {
    size: number;
    words: Iterable<AnnotatedWord>;
}

export interface Reader extends BaseReader, Iterable<string> {}

// Readers first match wins
const readers: ReaderSelector[] = [
    { test: /\.trie\b/, method: trieFileReader },
    { test: regHunspellFile, method: readHunspellFiles },
];

function findMatchingReader(filename: string, options: ReaderOptions): Promise<BaseReader> {
    for (const reader of readers) {
        if (reader.test.test(filename)) {
            return reader.method(filename, options);
        }
    }
    return textFileReader(filename, options);
}

export async function createReader(filename: string, options: ReaderOptions): Promise<Reader> {
    const baseReader = await findMatchingReader(filename, options);
    return Object.assign(baseReader, {
        [Symbol.iterator]: () => baseReader.words[Symbol.iterator](),
    });
}

export async function readHunspellFiles(filename: string, options: ReaderOptions): Promise<BaseReader> {
    const dicFile = filename.replace(regHunspellFile, '.dic');
    const affFile = filename.replace(regHunspellFile, '.aff');

    const reader = await HR.IterableHunspellReader.createFromFiles(affFile, dicFile);
    reader.maxDepth = options.maxDepth !== undefined ? options.maxDepth : reader.maxDepth;

    const words = pipe(reader.seqAffWords(), _mapAffWords, dedupeAndSort);

    return {
        size: reader.dic.length,
        words,
    };
}

async function trieFileReader(filename: string): Promise<BaseReader> {
    const trieRoot = importTrie(await readTextFileLines(filename));
    const trie = new Trie(trieRoot);
    const words = trie.words();
    return {
        get size() {
            return trie.size();
        },
        words,
    };
}

async function textFileReader(filename: string, options: ReaderOptions): Promise<BaseReader> {
    const content = await readTextFile(filename);
    const words = [...parseFileLines(content, { legacy: options.legacy, split: options.splitWords })];

    return {
        size: words.length,
        words,
    };
}

// function* _stripCaseAndAccents(words: Iterable<AnnotatedWord>): Iterable<AnnotatedWord> {
//     for (const word of words) {
//         // Words are normalized to the compact format: e + ` => è
//         yield word.normalize();
//         // covert to lower case and strip accents.
//         const n = word.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
//         // All words are added for case-insensitive searches.
//         // It is a space / speed trade-off. In this case, speed is more important.
//         yield CASE_INSENSITIVE_PREFIX + n;
//     }
// }

function* dedupeAndSort(words: Iterable<AnnotatedWord>): Iterable<AnnotatedWord> {
    const buffer = new Set<string>();

    function flush() {
        const result = [...buffer].sort();
        buffer.clear();
        return result;
    }

    for (const word of words) {
        buffer.add(word);
        if (buffer.size >= DEDUPE_SIZE) {
            yield* flush();
        }
    }
    yield* flush();
}

function* _mapAffWords(affWords: Iterable<AffWord>): Iterable<AnnotatedWord> {
    const hasSpecial = /[~+!]/;
    for (const affWord of affWords) {
        const { word, flags } = affWord;
        // For now do not include words with special characters.
        if (hasSpecial.test(word)) continue;
        const compound = flags.isCompoundForbidden ? '' : COMPOUND_FIX;
        const forbid = flags.isForbiddenWord ? FORBID_PREFIX : '';
        if (!forbid) {
            if (flags.canBeCompoundBegin || flags.isCompoundPermitted) yield word + compound;
            if (flags.canBeCompoundEnd || flags.isCompoundPermitted) yield compound + word;
            if (flags.canBeCompoundMiddle || flags.isCompoundPermitted) yield compound + word + compound;
            if (!flags.isOnlyAllowedInCompound) yield word;
        } else {
            yield forbid + word;
        }
    }
}
