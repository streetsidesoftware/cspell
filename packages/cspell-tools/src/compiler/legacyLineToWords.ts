import { opConcatMap, opFilter, opMap, pipe } from '@cspell/cspell-pipe/sync';

import type { AllowedSplitWords } from './AllowedSplitWords';
import * as Text from './text';

const regNonWord = /[^\p{L}\p{M}' 0-9]+/giu;
const regExpSpaceOrDash = /[- ]+/g;
const regExpRepeatChars = /(.)\1{4}/i;

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
    const missing = split.find((w) => !allowedWords.has(w));
    return missing === undefined ? split : [word];
}

function splitCamelCase(word: string): Iterable<string> {
    const splitWords = Text.splitCamelCaseWord(word);
    // We only want to preserve this: "New York" and not "Namespace DNSLookup"
    if (splitWords.length > 1 && regExpSpaceOrDash.test(word)) {
        return pipe(
            splitWords,
            opConcatMap((w) => w.split(regExpSpaceOrDash))
        );
    }
    return splitWords;
}
