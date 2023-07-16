import { opConcatMap, opFilter, opMap, pipe, toArray } from '@cspell/cspell-pipe/sync';
import type { ParsedText } from '@cspell/cspell-types';
import type { CachingDictionary, SearchOptions, SpellingDictionary } from 'cspell-dictionary';
import { createCachingDictionary } from 'cspell-dictionary';

import type { ValidationIssue } from '../Models/ValidationIssue.js';
import * as RxPat from '../Settings/RegExpPatterns.js';
import * as Text from '../util/text.js';
import { clean } from '../util/util.js';
import { split } from '../util/wordSplitter.js';
import { defaultMinWordLength } from './defaultConstants.js';
import { isWordValidWithEscapeRetry } from './isWordValid.js';
import { mapRangeBackToOriginalPos } from './parsedText.js';
import type {
    LineSegment,
    LineValidatorFn,
    MappedTextValidationResult,
    TextOffsetRO,
    TextValidatorFn,
    ValidationIssueRO,
    ValidationOptions,
} from './ValidationTypes.js';

interface LineValidator {
    fn: LineValidatorFn;
    dict: CachingDictionary;
}

export function lineValidatorFactory(sDict: SpellingDictionary, options: ValidationOptions): LineValidator {
    const {
        minWordLength = defaultMinWordLength,
        flagWords = [],
        allowCompoundWords = false,
        ignoreCase = true,
    } = options;
    const hasWordOptions: SearchOptions = {
        ignoreCase,
        useCompounds: allowCompoundWords || undefined, // let the dictionaries decide on useCompounds if allow is false
    };

    const dictCol = createCachingDictionary(sDict, hasWordOptions);

    const setOfFlagWords = new Set(flagWords);
    const setOfKnownSuccessfulWords = new Set<string>();
    const rememberFilter =
        <T extends TextOffsetRO>(fn: (v: T) => boolean) =>
        (v: T) => {
            const keep = fn(v);
            if (!keep) {
                setOfKnownSuccessfulWords.add(v.text);
            }
            return keep;
        };
    const filterAlreadyChecked = (wo: TextOffsetRO) => {
        return !setOfKnownSuccessfulWords.has(wo.text);
    };

    function testForFlaggedWord(wo: TextOffsetRO): boolean {
        const text = wo.text;
        return setOfFlagWords.has(text) || setOfFlagWords.has(text.toLowerCase()) || dictCol.isForbidden(text);
    }

    function isWordIgnored(word: string): boolean {
        return dictCol.isNoSuggestWord(word);
    }

    function getSuggestions(word: string) {
        return dictCol.getPreferredSuggestions(word);
    }

    function isWordFlagged(word: TextOffsetRO): boolean {
        const isIgnored = isWordIgnored(word.text);
        const isFlagged = !isIgnored && testForFlaggedWord(word);
        return isFlagged;
    }

    function annotateIsFlagged(word: ValidationIssue): ValidationIssueRO {
        word.isFlagged = isWordFlagged(word);
        return word;
    }

    function annotateIssue(issue: ValidationIssue): ValidationIssue {
        const sugs = getSuggestions(issue.text);
        if (sugs && sugs.length) {
            issue.suggestionsEx = sugs;
        }
        return issue;
    }

    function checkWord(word: ValidationIssueRO): ValidationIssueRO {
        const isIgnored = isWordIgnored(word.text);
        const { isFlagged = !isIgnored && testForFlaggedWord(word) } = word;
        const isFound = isFlagged ? undefined : isIgnored || isWordValidWithEscapeRetry(dictCol, word, word.line);
        return clean({ ...word, isFlagged, isFound });
    }

    const fn: LineValidatorFn = (lineSegment: LineSegment) => {
        function splitterIsValid(word: TextOffsetRO): boolean {
            return (
                setOfKnownSuccessfulWords.has(word.text) ||
                (!testForFlaggedWord(word) && isWordValidWithEscapeRetry(dictCol, word, lineSegment.line))
            );
        }

        function checkFullWord(vr: ValidationIssueRO): Iterable<ValidationIssueRO> {
            if (vr.isFlagged) {
                return [vr];
            }

            const codeWordResults = toArray(
                pipe(
                    Text.extractWordsFromCodeTextOffset(vr),
                    opFilter(filterAlreadyChecked),
                    opMap((t) => ({ ...t, line: vr.line })),
                    opMap(annotateIsFlagged),
                    opFilter(rememberFilter((wo) => wo.text.length >= minWordLength || !!wo.isFlagged)),
                    opMap((wo) => (wo.isFlagged ? wo : checkWord(wo))),
                    opFilter(rememberFilter((wo) => wo.isFlagged || !wo.isFound)),
                    opFilter(rememberFilter((wo) => !RxPat.regExRepeatedChar.test(wo.text))),

                    // get back the original text.
                    opMap((wo) => ({
                        ...wo,
                        text: Text.extractText(lineSegment.segment, wo.offset, wo.offset + wo.text.length),
                    })),
                ),
            );

            if (!codeWordResults.length || isWordIgnored(vr.text) || checkWord(vr).isFound) {
                rememberFilter((_) => false)(vr);
                return [];
            }

            return codeWordResults;
        }

        function checkPossibleWords(possibleWord: TextOffsetRO) {
            if (isWordFlagged(possibleWord)) {
                const vr: ValidationIssueRO = {
                    ...possibleWord,
                    line: lineSegment.line,
                    isFlagged: true,
                };
                return [vr];
            }

            const mismatches: ValidationIssue[] = toArray(
                pipe(
                    Text.extractWordsFromTextOffset(possibleWord),
                    opFilter(filterAlreadyChecked),
                    opMap((wo) => ({ ...wo, line: lineSegment.line })),
                    opMap(annotateIsFlagged),
                    opFilter(rememberFilter((wo) => wo.text.length >= minWordLength || !!wo.isFlagged)),
                    opConcatMap(checkFullWord),
                ),
            );
            if (mismatches.length) {
                // Try the more expensive word splitter
                const splitResult = split(lineSegment.segment, possibleWord.offset, splitterIsValid);
                const nonMatching = splitResult.words.filter((w) => !w.isFound);
                if (nonMatching.length < mismatches.length) {
                    return nonMatching.map((w) => ({ ...w, line: lineSegment.line })).map(annotateIsFlagged);
                }
            }
            return mismatches;
        }

        const checkedPossibleWords: Iterable<ValidationIssue> = pipe(
            Text.extractPossibleWordsFromTextOffset(lineSegment.segment),
            opFilter(filterAlreadyChecked),
            opConcatMap(checkPossibleWords),
            opMap(annotateIssue),
        );
        return checkedPossibleWords;
    };

    return { fn, dict: dictCol };
}

export interface TextValidator {
    validate: TextValidatorFn;
    lineValidator: LineValidator;
}

export function textValidatorFactory(dict: SpellingDictionary, options: ValidationOptions): TextValidator {
    const lineValidator = lineValidatorFactory(dict, options);
    const lineValidatorFn = lineValidator.fn;

    function validate(pText: ParsedText): Iterable<MappedTextValidationResult> {
        const { text, range: srcRange, map } = pText;
        const srcOffset = srcRange[0];
        const segment = { text, offset: 0 };
        const lineSegment: LineSegment = { line: segment, segment };
        function mapBackToOriginSimple(vr: ValidationIssue): MappedTextValidationResult {
            const { text, offset, isFlagged, isFound, suggestionsEx } = vr;
            const r = mapRangeBackToOriginalPos([offset, offset + text.length], map);
            const range = [r[0] + srcOffset, r[1] + srcOffset] as [number, number];
            return { text, range, isFlagged, isFound, suggestionsEx };
        }
        return [...lineValidatorFn(lineSegment)].map(mapBackToOriginSimple);
    }

    return {
        validate,
        lineValidator,
    };
}
