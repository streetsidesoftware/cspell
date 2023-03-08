// cSpell:enableCompoundWords
import { readLines } from './util/fileReader';
import { concatIterables, toIterableIterator } from './util/iterableIteratorLib';
import { logError } from './util/logger';
import * as Text from './util/text';

const regExpWordsWithSpaces = /^\s*\p{L}+(?:\s+\p{L}+){0,3}$/u;

export interface WordDictionary {
    [index: string]: boolean;
}

export type WordSet = Set<string>;

/**
 * Reads words from a file. It will not throw and error.
 * @param filename the file to read
 */
export function loadWordsNoError(filename: string): Promise<IterableIterator<string>> {
    return readLines(filename).catch((e) => (logError(e), toIterableIterator<string>([])));
}

export function splitLine(line: string): string[] {
    return [...Text.extractWordsFromText(line)].map(({ text }) => text);
}

export function splitCodeWords(words: string[]): string[] {
    return words.map(Text.splitCamelCaseWord).reduce((a, b) => a.concat(b), []);
}

export function splitLineIntoCodeWords(line: string): IterableIterator<string> {
    const asMultiWord = regExpWordsWithSpaces.test(line) ? [line] : [];
    const asWords = splitLine(line);
    const splitWords = splitCodeWords(asWords);
    const wordsToAdd = new Set(concatIterables(asMultiWord, asWords, splitWords));
    return toIterableIterator(wordsToAdd);
}

export function splitLineIntoWords(line: string): IterableIterator<string> {
    const asWords = splitLine(line);
    return concatIterables([line], asWords);
}
