import { Sequence, genSequence, operators } from 'gensequence';
import * as HR from 'hunspell-reader';
import * as fs from 'fs-extra';
import { Trie, importTrie } from 'cspell-trie-lib';
import * as zlib from 'zlib';
import { AffWord } from 'hunspell-reader/dist/aff';

const regHunspellFile = /\.(dic|aff)$/i;

export interface ReaderOptions {
    maxDepth?: number;
}

type ReaderFn = (filename: string, options: ReaderOptions) => Promise<Reader>;

const COMPOUND = '+';
const OPTIONAL_COMPOUND = '*';
const NORMALIZED = '~';
const FORBID = '!';

// cspell:word dedupe
const DEDUPE_SIZE = 1000;

interface ReaderSelector {
    test: RegExp;
    method: ReaderFn;
}

export type AnnotatedWord = string;

export interface Reader {
    size: number;
    [Symbol.iterator]: () => Sequence<string>;
    annotatedWords: () => Sequence<AnnotatedWord>;
}

const regExMatchComments = /\s*(#|\/\/).*/;

// Readers first match wins
const readers: ReaderSelector[] = [
    { test: /\.trie\b/, method: trieFileReader },
    { test: regHunspellFile, method: readHunspellFiles },
];

export function createReader(filename: string, options: ReaderOptions): Promise<Reader> {
    for (const reader of readers) {
        if (reader.test.test(filename)) {
            return reader.method(filename, options);
        }
    }
    return textFileReader(filename);
}

export function createArrayReader(lines: string[]): Reader {
    return {
        size: lines.length,
        [Symbol.iterator]: () => genSequence(lines),
        annotatedWords() { return genSequence(lines).pipe(_mapText).pipe(dedupeAndSort); },
    };
}

export async function readHunspellFiles(filename: string, options: ReaderOptions): Promise<Reader> {
    const dicFile = filename.replace(regHunspellFile, '.dic');
    const affFile = filename.replace(regHunspellFile, '.aff');

    const reader = await HR.IterableHunspellReader.createFromFiles(affFile, dicFile);
    reader.maxDepth = options.maxDepth !== undefined ? options.maxDepth : reader.maxDepth;

    const normalizeAndDedupe = operators.pipe(_stripCaseAndAccents, dedupeAndSort);

    return {
        size: reader.dic.length,
        // seqWords is used for backwards compatibility.
        [Symbol.iterator]: () => reader.seqWords(),
        annotatedWords() { return reader.seqAffWords().pipe(_mapAffWords).pipe(normalizeAndDedupe); },
    };
}

async function trieFileReader(filename: string): Promise<Reader> {
    const trieRoot = importTrie(await textFileReader(filename));
    const trie = new Trie(trieRoot);
    return {
        get size() { return trie.size(); },
        [Symbol.iterator]: () => trie.words(),
        annotatedWords() { return trie.words(); },
    };
}

async function textFileReader(filename: string): Promise<Reader> {
    const content = await fs.readFile(filename)
        .then(buffer => (/\.gz$/).test(filename) ? zlib.gunzipSync(buffer) : buffer)
        .then(buffer => buffer.toString('utf8'))
        ;
    const lines = content.split('\n');
    return createArrayReader(lines);
}

const _mapText = operators.pipe(_comments, _compoundBegin, _compoundEnd, _stripCaseAndAccents);

function *_comments(lines: Iterable<string>): Generator<AnnotatedWord> {
    for (const line of lines) {
        const w = line.replace(regExMatchComments, '').trim();
        if (w) yield w;
    }
}

function *_compoundEnd(lines: Iterable<string>): Generator<AnnotatedWord> {
    for (const line of lines) {
        if (line[0] !== OPTIONAL_COMPOUND) {
            yield line;
            continue;
        }
        const w = line.slice(1);
        yield w;
        yield COMPOUND + w;
    }
}

function *_compoundBegin(lines: Iterable<string>): Generator<AnnotatedWord> {
    for (const line of lines) {
        if (line[line.length - 1] !== OPTIONAL_COMPOUND) {
            yield line;
            continue;
        }
        const w = line.slice(0, -1);
        yield w;
        yield w + COMPOUND;
    }
}

const regNotLower = /[^a-z+!~]/;

function *_stripCaseAndAccents(words: Iterable<AnnotatedWord>): Generator<AnnotatedWord> {
    for (const word of words) {
        yield word;
        if (regNotLower.test(word)) {
            // covert to lower case and strip accents.
            const n = word.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            yield NORMALIZED + n;
        }
    }
}

function *dedupeAndSort(words: Iterable<AnnotatedWord>): Iterable<AnnotatedWord> {
    const buffer: AnnotatedWord[] = [];

    function sortDedupeClear() {
        const s = new Set(buffer.sort());
        buffer.length = 0;
        return s;
    }

    for (const word of words) {
        buffer.push(word);
        if (buffer.length >= DEDUPE_SIZE) {
            yield *sortDedupeClear();
        }
    }
    yield *sortDedupeClear();
}

function *_mapAffWords(affWords: Iterable<AffWord>): Generator<AnnotatedWord> {
    for (const affWord of affWords) {
        const { word, flags } = affWord;
        const compound = flags.isCompoundForbidden ? '' : COMPOUND;
        const forbid = flags.isForbiddenWord ? FORBID : '';
        if (!forbid) {
            if (flags.canBeCompoundBegin) yield word + compound;
            if (flags.canBeCompoundEnd) yield compound + word;
            if (flags.canBeCompoundMiddle) yield compound + word + compound;
            if (!flags.isOnlyAllowedInCompound) yield word;
        } else {
            yield forbid + word;
        }
    }
}
