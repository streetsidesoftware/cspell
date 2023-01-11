import { opConcatMap, opFilter, opMap, pipe } from '@cspell/cspell-pipe/sync';

import * as Text from './text';

const regNonWord = /[^\p{L}\p{M}' ]+/giu;
const regExpSpaceOrDash = /[- ]+/g;
const regExpRepeatChars = /(.)\1{4,}/i;

export function legacyLineToWords(line: string, keepCase: boolean): Iterable<string> {
    // Remove punctuation and non-letters.
    const filteredLine = line.replace(regNonWord, '|');
    const wordGroups = filteredLine.split('|');

    const words = pipe(
        wordGroups,
        opConcatMap((a) => [a, ...a.split(regExpSpaceOrDash)]),
        opConcatMap((a) => splitCamelCase(a)),
        opMap((a) => a.trim()),
        opFilter((a) => !!a),
        opFilter((s) => !regExpRepeatChars.test(s)),
        opMap((a) => (keepCase ? a : a.toLowerCase()))
    );

    return words;
}

export function* legacyLinesToWords(lines: Iterable<string>, keepCase = false): Iterable<string> {
    for (const line of lines) {
        yield* legacyLineToWords(line, keepCase);
    }
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
