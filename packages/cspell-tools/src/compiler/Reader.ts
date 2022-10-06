import {
    CASE_INSENSITIVE_PREFIX,
    COMPOUND_FIX,
    FORBID_PREFIX,
    importTrie,
    OPTIONAL_COMPOUND_FIX,
    Trie,
} from 'cspell-trie-lib';
import * as HR from 'hunspell-reader';
import { AffWord } from 'hunspell-reader';
import { readTextFileLines } from './readTextFile';
import { pipe } from '@cspell/cspell-pipe/sync';

const regHunspellFile = /\.(dic|aff)$/i;

export interface ReaderOptions {
    useAnnotation?: boolean;
    maxDepth?: number;
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
    annotatedWords: Iterable<AnnotatedWord>;
    rawWords: Iterable<string>;
}

export interface Reader extends BaseReader, Iterable<string> {}

const regExMatchComments = /\s*(#|\/\/).*/;

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
        [Symbol.iterator]: () =>
            (options.useAnnotation ? baseReader.annotatedWords : baseReader.rawWords)[Symbol.iterator](),
    });
}

export function createArrayReader(lines: string[]): BaseReader {
    const rawWords = lines;
    const annotatedWords = pipe(lines, _mapText, dedupeAndSort);

    return {
        size: lines.length,
        annotatedWords,
        rawWords,
    };
}

export async function readHunspellFiles(filename: string, options: ReaderOptions): Promise<BaseReader> {
    const dicFile = filename.replace(regHunspellFile, '.dic');
    const affFile = filename.replace(regHunspellFile, '.aff');

    const reader = await HR.IterableHunspellReader.createFromFiles(affFile, dicFile);
    reader.maxDepth = options.maxDepth !== undefined ? options.maxDepth : reader.maxDepth;

    const normalizeAndDedupe = opCompose(_stripCaseAndAccents, dedupeAndSort);
    const rawWords = reader.seqWords();
    const annotatedWords = pipe(reader.seqAffWords(), _mapAffWords, normalizeAndDedupe);

    return {
        size: reader.dic.length,
        annotatedWords,
        rawWords,
    };
}

async function trieFileReader(filename: string): Promise<BaseReader> {
    const trieRoot = importTrie(await readTextFileLines(filename));
    const trie = new Trie(trieRoot);
    const rawWords = trie.words();
    return {
        get size() {
            return trie.size();
        },
        annotatedWords: rawWords,
        rawWords,
    };
}

async function textFileReader(filename: string, _options: ReaderOptions): Promise<BaseReader> {
    const lines = await readTextFileLines(filename);
    return createArrayReader(lines);
}

const _mapText = opCompose(_comments, _compoundBegin, _compoundEnd, _stripCaseAndAccents);

function* _comments(lines: Iterable<string>): Iterable<AnnotatedWord> {
    for (const line of lines) {
        const w = line.replace(regExMatchComments, '').trim();
        if (w) yield w;
    }
}

function* _compoundEnd(lines: Iterable<string>): Iterable<AnnotatedWord> {
    for (const line of lines) {
        if (line[0] !== OPTIONAL_COMPOUND_FIX) {
            yield line;
            continue;
        }
        const w = line.slice(1);
        yield w;
        yield COMPOUND_FIX + w;
    }
}

function* _compoundBegin(lines: Iterable<string>): Iterable<AnnotatedWord> {
    for (const line of lines) {
        if (line[line.length - 1] !== OPTIONAL_COMPOUND_FIX) {
            yield line;
            continue;
        }
        const w = line.slice(0, -1);
        yield w;
        yield w + COMPOUND_FIX;
    }
}

function* _stripCaseAndAccents(words: Iterable<AnnotatedWord>): Iterable<AnnotatedWord> {
    for (const word of words) {
        // Words are normalized to the compact format: e + ` => è
        yield word.normalize();
        // covert to lower case and strip accents.
        const n = word.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
        // All words are added for case-insensitive searches.
        // It is a space / speed trade-off. In this case, speed is more important.
        yield CASE_INSENSITIVE_PREFIX + n;
    }
}

function* dedupeAndSort(words: Iterable<AnnotatedWord>): Iterable<AnnotatedWord> {
    const buffer: AnnotatedWord[] = [];

    function sortDedupeClear() {
        const s = new Set(buffer.sort());
        buffer.length = 0;
        return s;
    }

    for (const word of words) {
        buffer.push(word);
        if (buffer.length >= DEDUPE_SIZE) {
            yield* sortDedupeClear();
        }
    }
    yield* sortDedupeClear();
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

function opCompose<T>(...ops: ((i: Iterable<T>) => Iterable<T>)[]): (i: Iterable<T>) => Iterable<T> {
    return (i: Iterable<T>) => {
        for (const op of ops) {
            i = op(i);
        }
        return i;
    };
}

export const __testing__ = {
    _stripCaseAndAccents,
};
