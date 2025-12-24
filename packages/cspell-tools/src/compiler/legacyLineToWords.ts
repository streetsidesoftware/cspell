import { opConcatMap, opFilter, opMap, pipe } from '@cspell/cspell-pipe/sync';

import { defaultCompileSourceOptions } from '../config/configDefaults.ts';
import { regExpSpaceOrDash, splitCamelCaseIfAllowed } from './splitCamelCaseIfAllowed.ts';
import type { AllowedSplitWordsCollection } from './WordsCollection.ts';

const regNonWord = /[^\p{L}\p{M}' _\d]+/giu;
const regExpRepeatChars = /(.)\1{5}/i;

const minCompoundLength = defaultCompileSourceOptions.minCompoundLength;

export function legacyLineToWords(
    line: string,
    keepCase: boolean,
    allowedSplitWords: AllowedSplitWordsCollection,
): Iterable<string> {
    // Remove punctuation and non-letters.
    const filteredLine = line.replaceAll(regNonWord, '|');
    const wordGroups = filteredLine.split('|');

    const _minCompoundLength = minCompoundLength;

    const words = pipe(
        wordGroups,
        opConcatMap((a) => a.split(regExpSpaceOrDash)),
        opConcatMap((a) => splitCamelCaseIfAllowed(a, allowedSplitWords, keepCase, '', _minCompoundLength)),
        opMap((a) => a.trim()),
        opFilter((a) => !!a),
        opFilter((s) => !regExpRepeatChars.test(s)),
    );

    return words;
}

export function* legacyLinesToWords(
    lines: Iterable<string>,
    keepCase: boolean,
    allowedSplitWords: AllowedSplitWordsCollection,
): Iterable<string> {
    for (const line of lines) {
        yield* legacyLineToWords(line, keepCase, allowedSplitWords);
    }
}
