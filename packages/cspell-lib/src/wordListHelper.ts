// cSpell:enableCompoundWords
import * as Text from './util/text';
import { readLines } from './util/fileReader';
import { xregexp as XRegExp } from 'cspell-util-bundle';
import { toIterableIterator, concatIterables } from './util/iterableIteratorLib';
import { logError } from './util/logger';


const regExpWordsWithSpaces = XRegExp('^\\s*\\p{L}+(?:\\s+\\p{L}+){0,3}$');

export interface WordDictionary {
    [index: string]: boolean;
}

export type WordSet = Set<string>;

/**
 * Reads words from a file. It will not throw and error.
 * @param filename the file to read
 */
export function loadWordsNoError(filename: string) {
    return readLines(filename).catch(
        e => (logError(e), toIterableIterator<string>([]))
    );
}

export function splitLine(line: string) {
    return Text.extractWordsFromText(line).map(({text}) => text).toArray();
}

export function splitCodeWords(words: string[]) {
    return words
        .map(Text.splitCamelCaseWord)
        .reduce((a, b) => a.concat(b), []);
}

export function splitLineIntoCodeWords(line: string): IterableIterator<string> {
    const asMultiWord = regExpWordsWithSpaces.test(line) ? [ line ] : [];
    const asWords = splitLine(line);
    const splitWords = splitCodeWords(asWords);
    const wordsToAdd = new Set(concatIterables(asMultiWord, asWords, splitWords));
    return toIterableIterator(wordsToAdd);
}

export function splitLineIntoWords(line: string): IterableIterator<string> {
    const asWords = splitLine(line);
    return concatIterables([line], asWords);
}
