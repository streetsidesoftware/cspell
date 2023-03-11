import { opConcatMap, opFilter, opMap, pipe } from '@cspell/cspell-pipe/sync';

import type { AllowedSplitWords } from './AllowedSplitWords';
import * as Text from './text';

const regNonWord = /[^\p{L}\p{M}' \d]+/giu;
const regExpSpaceOrDash = /[- ]+/g;
const regExpRepeatChars = /(.)\1{5}/i;
const regExpIsNumber = /^\d+$/;

export function legacyLineToWords(
    line: string,
    keepCase: boolean,
    allowedSplitWords: AllowedSplitWords
): Iterable<string> {
    // Remove punctuation and non-letters.
    const filteredLine = line.replace(regNonWord, '|');
    const wordGroups = filteredLine.split('|');

    const words = pipe(
        wordGroups,
        opConcatMap((a) => [...a.split(regExpSpaceOrDash)]),
        opConcatMap((a) => splitCamelCaseIfAllowed(a, allowedSplitWords, keepCase)),
        opMap((a) => a.trim()),
        opFilter((a) => !!a),
        opFilter((s) => !regExpRepeatChars.test(s))
    );

    return words;
}

export function* legacyLinesToWords(
    lines: Iterable<string>,
    keepCase: boolean,
    allowedSplitWords: AllowedSplitWords
): Iterable<string> {
    for (const line of lines) {
        yield* legacyLineToWords(line, keepCase, allowedSplitWords);
    }
}

function splitCamelCaseIfAllowed(word: string, allowedWords: AllowedSplitWords, keepCase: boolean): string[] {
    const split = [...splitCamelCase(word)].map((a) => (keepCase ? a : a.toLowerCase()));
    const missing = split.find((w) => isUnknown(w, allowedWords));
    const words = missing === undefined ? split : [word];
    return keepCase ? words : words.map(adjustCase);
}

function adjustCase(word: string): string {
    if (word[0].toLowerCase() == word[0]) return word;
    if (word.slice(1).toLowerCase() === word.slice(1)) return word[0].toLowerCase() + word.slice(1);
    if (word.toUpperCase() === word) return word.toLowerCase();
    return word;
}

function isUnknown(word: string, allowedWords: AllowedSplitWords): boolean {
    return word.length > 3 && !allowedWords.has(word);
}

function splitCamelCase(word: string): Iterable<string> {
    const splitWords = Text.splitCamelCaseWord(word).filter((word) => !regExpIsNumber.test(word));
    // We only want to preserve this: "New York" and not "Namespace DNSLookup"
    if (splitWords.length > 1 && regExpSpaceOrDash.test(word)) {
        return pipe(
            splitWords,
            opConcatMap((w) => w.split(regExpSpaceOrDash))
        );
    }
    return splitWords;
}
