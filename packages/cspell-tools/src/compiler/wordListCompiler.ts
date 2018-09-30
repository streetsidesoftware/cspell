import * as fs from 'fs';
import * as XRegExp from 'xregexp';
import { genSequence, Sequence } from 'gensequence';
import * as Text from './text';
import { lineReaderRx } from './fileReader';
import { writeToFileRxP} from 'cspell-lib';
import { Observable, zip, from } from 'rxjs';
import { flatMap, reduce, map, bufferCount, filter, distinct } from 'rxjs/operators';
import * as path from 'path';
import { mkdirp } from 'fs-extra';
import * as Trie from 'cspell-trie';
import * as HR from 'hunspell-reader';

const regNonWordOrSpace = XRegExp("[^\\p{L}' ]+", 'gi');
const regExpSpaceOrDash = /(?:\s+)|(?:-+)/g;
const regExpRepeatChars = /(.)\1{3,}/i;

export function normalizeWords(lines: Observable<string>) {
    return lines.pipe(flatMap(line => lineToWords(line)));
}

export function lineToWords(line: string): Sequence<string> {
    // Remove punctuation and non-letters.
    const filteredLine = line.replace(regNonWordOrSpace, '|');
    const wordGroups = filteredLine.split('|');

    const words = genSequence(wordGroups)
        .concatMap(a => [a, ...a.split(regExpSpaceOrDash)])
        .concatMap(a => splitCamelCase(a))
        .map(a => a.trim())
        .filter(a => !!a)
        .filter(s => !regExpRepeatChars.test(s))
        .map(a => a.toLowerCase());

    return words;
}

function splitCamelCase(word: string): Sequence<string> | string[] {
    const splitWords = Text.splitCamelCaseWord(word);
    // We only want to preserve this: "New York" and not "Namespace DNSLookup"
    if (splitWords.length > 1 && regExpSpaceOrDash.test(word)) {
        return genSequence(splitWords).concatMap(w => w.split(regExpSpaceOrDash));
    }
    return splitWords;
}

interface CompileWordListOptions {
    splitWords: boolean;
}

export function compileWordList(filename: string, destFilename: string, options: CompileWordListOptions): Promise<void> {
    return options.splitWords
        ? compileWordListWithSplit(filename, destFilename)
        : compileSimpleWordList(filename, destFilename);
}

export function compileWordListWithSplit(filename: string, destFilename: string): Promise<void> {
    const getWords = () => regHunspellFile.test(filename) ? readHunspellFiles(filename) : lineReaderRx(filename);

    const destDir = path.dirname(destFilename);

    return mkdirp(destDir).then(() => writeToFileRxP(destFilename, getWords().pipe(
        flatMap(line => lineToWords(line).toArray()),
        distinct(),
        map(a => a + '\n'),
        bufferCount(1024),
        map(a => a.join('')),
    )));
}

export function compileSimpleWordList(filename: string, destFilename: string): Promise<void> {
    const getWords = () => regHunspellFile.test(filename) ? readHunspellFiles(filename) : lineReaderRx(filename);
    const destDir = path.dirname(destFilename);
    return mkdirp(destDir).then(() => writeToFileRxP(destFilename, getWords().pipe(
        map(a => a.toLowerCase()),
        distinct(),
        filter(a => !!a),
        map(a => a + '\n'),
        bufferCount(1024),
        map(a => a.join('')),
    )));
}

export function normalizeWordsToTrie(words: Observable<string>): Promise<Trie.TrieNode> {
    const result = normalizeWords(words)
        .pipe(reduce((node: Trie.TrieNode, word: string) => Trie.insert(word, node), {} as Trie.TrieNode))
        .toPromise();
    return result;
}

export function compileWordListToTrieFile(words: Observable<string>, destFilename: string): Promise<void> {
    const destDir = path.dirname(destFilename);
    const dir = mkdirp(destDir);
    const root = normalizeWordsToTrie(words);

    const data = zip(dir, root, (_: void, b: Trie.TrieNode) => b).pipe(
        map(node => Trie.serializeTrie(node, { base: 32, comment: 'Built by cspell-tools.' })),
        flatMap(seq => from(seq)),
    );

    return writeToFileRxP(destFilename, data.pipe(bufferCount(1024), map(a => a.join(''))));
}

const regHunspellFile = /\.(dic|aff)$/i;

function readHunspellFiles(filename: string): Observable<string> {
    const dicFile = filename.replace(regHunspellFile, '.dic');
    const affFile = filename.replace(regHunspellFile, '.aff');

    const reader = HR.HunspellReader.createFromFiles(affFile, dicFile);

    const r = from(reader).pipe(
        flatMap(reader => reader.readWordsRx()),
        map(aff => aff.word),
    );
    return r;
}

export function compileTrie(filename: string, destFilename: string): Promise<void> {
    const words = regHunspellFile.test(filename) ? readHunspellFiles(filename) : lineReaderRx(filename);
    return compileWordListToTrieFile(words, destFilename);
}
