import { xregexp as XRegExp } from 'cspell-util-bundle';
import { genSequence, Sequence } from 'gensequence';
import * as Text from './text';
import * as path from 'path';
import { mkdirp } from 'fs-extra';
import * as Trie from 'cspell-trie-lib';
import { writeSeqToFile } from './fileWriter';
import { uniqueFilter } from 'hunspell-reader/dist/util';

const regNonWordOrSpace = XRegExp("[^\\p{L}' ]+", 'gi');
const regExpSpaceOrDash = /(?:\s+)|(?:-+)/g;
const regExpRepeatChars = /(.)\1{3,}/i;

export type Logger = (message?: any, ...optionalParams: any[]) => void;

let log: Logger = defaultLogger;

export function setLogger(logger?: Logger) {
    log = logger ?? defaultLogger;
}

function defaultLogger(message?: any, ...optionalParams: any[]) {
    console.log(message, ...optionalParams);
}

export function normalizeWords(lines: Sequence<string>) {
    return lines.concatMap((line) => lineToWords(line));
}

export function lineToWords(line: string): Sequence<string> {
    // Remove punctuation and non-letters.
    const filteredLine = line.replace(regNonWordOrSpace, '|');
    const wordGroups = filteredLine.split('|');

    const words = genSequence(wordGroups)
        .concatMap((a) => [a, ...a.split(regExpSpaceOrDash)])
        .concatMap((a) => splitCamelCase(a))
        .map((a) => a.trim())
        .filter((a) => !!a)
        .filter((s) => !regExpRepeatChars.test(s))
        .map((a) => a.toLowerCase());

    return words;
}

function splitCamelCase(word: string): Sequence<string> | string[] {
    const splitWords = Text.splitCamelCaseWord(word);
    // We only want to preserve this: "New York" and not "Namespace DNSLookup"
    if (splitWords.length > 1 && regExpSpaceOrDash.test(word)) {
        return genSequence(splitWords).concatMap((w) => w.split(regExpSpaceOrDash));
    }
    return splitWords;
}

interface CompileWordListOptions {
    splitWords: boolean;
    sort: boolean;
}

export async function compileWordList(
    words: Sequence<string>,
    destFilename: string,
    options: CompileWordListOptions
): Promise<void> {
    const destDir = path.dirname(destFilename);

    const pDir = mkdirp(destDir);

    const compile = options.splitWords ? compileWordListWithSplitSeq : compileSimpleWordListSeq;
    const seq = compile(words)
        .filter((a) => !!a)
        .filter(uniqueFilter(10000));

    const finalSeq = options.sort ? genSequence(sort(seq)) : seq;

    await pDir;

    return writeSeqToFile(
        finalSeq.map((a) => a + '\n'),
        destFilename
    );
}

function sort(words: Iterable<string>): Iterable<string> {
    return [...words].sort();
}

function compileWordListWithSplitSeq(words: Sequence<string>): Sequence<string> {
    return words.concatMap((line) => lineToWords(line).toArray());
}

function compileSimpleWordListSeq(words: Sequence<string>): Sequence<string> {
    return words.map((a) => a.toLowerCase());
}

export function normalizeWordsToTrie(words: Sequence<string>): Trie.TrieNode {
    const trie = Trie.buildTrie(normalizeWords(words));
    return trie.root;
}

export interface CompileTrieOptions {
    base?: number;
    trie3?: boolean;
}

export const consolidate = Trie.consolidate;

export async function compileTrie(
    words: Sequence<string>,
    destFilename: string,
    options: CompileTrieOptions
): Promise<void> {
    log('Reading Words into Trie');
    const base = options.base ?? 32;
    const version = options.trie3 ? 3 : 1;
    const destDir = path.dirname(destFilename);
    const pDir = mkdirp(destDir);
    const root = normalizeWordsToTrie(words);
    log('Reduce duplicate word endings');
    const trie = consolidate(root);
    log(`Writing to file ${path.basename(destFilename)}`);
    await pDir;
    await writeSeqToFile(Trie.serializeTrie(trie, { base, comment: 'Built by cspell-tools.', version }), destFilename);
    log(`Done writing to file ${path.basename(destFilename)}`);
}
