import { opConcatMap, opFilter, opMap, pipeSync as pipe, toArray } from '@cspell/cspell-pipe';
import { genSequence, Sequence } from 'gensequence';
import * as RxPat from '../Settings/RegExpPatterns';
import { SpellingDictionary } from '../SpellingDictionary/SpellingDictionary';
import * as Text from '../util/text';
import { clean } from '../util/util';
import { split } from '../util/wordSplitter';
import { defaultMinWordLength } from './textValidator';
import { IsWordValidOptions, isWordValidWithEscapeRetry } from './isWordValid';
import type {
    LineSegment,
    LineValidator,
    ParsedTextValidationResult,
    TextOffsetRO,
    TextValidator,
    ValidationOptions,
    ValidationResult,
    ValidationResultRO,
} from './ValidationTypes';
import { ParsedText } from '@cspell/cspell-types';
import { mapRangeBackToOriginalPos } from './parsedText';

export function lineValidatorFactory(dict: SpellingDictionary, options: ValidationOptions): LineValidator {
    const {
        minWordLength = defaultMinWordLength,
        flagWords = [],
        allowCompoundWords = false,
        ignoreCase = true,
    } = options;
    const hasWordOptions: IsWordValidOptions = {
        ignoreCase,
        useCompounds: allowCompoundWords || undefined, // let the dictionaries decide on useCompounds if allow is false
    };

    const dictCol = dict;

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
        return dict.isNoSuggestWord(word, options);
    }

    function isWordFlagged(word: TextOffsetRO): boolean {
        const isIgnored = isWordIgnored(word.text);
        const isFlagged = !isIgnored && testForFlaggedWord(word);
        return isFlagged;
    }

    function checkFlagWords(word: ValidationResult): ValidationResultRO {
        word.isFlagged = isWordFlagged(word);
        return word;
    }

    function checkWord(word: ValidationResultRO, options: IsWordValidOptions): ValidationResultRO {
        const isIgnored = isWordIgnored(word.text);
        const { isFlagged = !isIgnored && testForFlaggedWord(word) } = word;
        const isFound = isFlagged
            ? undefined
            : isIgnored || isWordValidWithEscapeRetry(dictCol, word, word.line, options);
        return clean({ ...word, isFlagged, isFound });
    }

    const fn: LineValidator = (lineSegment: LineSegment) => {
        function splitterIsValid(word: TextOffsetRO): boolean {
            return (
                setOfKnownSuccessfulWords.has(word.text) ||
                (!testForFlaggedWord(word) &&
                    isWordValidWithEscapeRetry(dictCol, word, lineSegment.line, hasWordOptions))
            );
        }

        function checkFullWord(vr: ValidationResultRO): Iterable<ValidationResultRO> {
            if (vr.isFlagged) {
                return [vr];
            }

            const codeWordResults = toArray(
                pipe(
                    Text.extractWordsFromCodeTextOffset(vr),
                    opFilter(filterAlreadyChecked),
                    opMap((t) => ({ ...t, line: vr.line })),
                    opMap(checkFlagWords),
                    opFilter(rememberFilter((wo) => wo.text.length >= minWordLength || !!wo.isFlagged)),
                    opMap((wo) => (wo.isFlagged ? wo : checkWord(wo, hasWordOptions))),
                    opFilter(rememberFilter((wo) => wo.isFlagged || !wo.isFound)),
                    opFilter(rememberFilter((wo) => !RxPat.regExRepeatedChar.test(wo.text))),

                    // get back the original text.
                    opMap((wo) => ({
                        ...wo,
                        text: Text.extractText(lineSegment.segment, wo.offset, wo.offset + wo.text.length),
                    }))
                )
            );

            if (!codeWordResults.length || isWordIgnored(vr.text) || checkWord(vr, hasWordOptions).isFound) {
                rememberFilter((_) => false)(vr);
                return [];
            }

            return codeWordResults;
        }

        function checkPossibleWords(possibleWord: TextOffsetRO) {
            if (isWordFlagged(possibleWord)) {
                const vr: ValidationResultRO = {
                    ...possibleWord,
                    line: lineSegment.line,
                    isFlagged: true,
                };
                return [vr];
            }

            const mismatches: ValidationResult[] = toArray(
                pipe(
                    Text.extractWordsFromTextOffset(possibleWord),
                    opFilter(filterAlreadyChecked),
                    opMap((wo) => ({ ...wo, line: lineSegment.line })),
                    opMap(checkFlagWords),
                    opFilter(rememberFilter((wo) => wo.text.length >= minWordLength || !!wo.isFlagged)),
                    opConcatMap(checkFullWord)
                )
            );
            if (mismatches.length) {
                // Try the more expensive word splitter
                const splitResult = split(lineSegment.segment, possibleWord.offset, splitterIsValid);
                const nonMatching = splitResult.words.filter((w) => !w.isFound);
                if (nonMatching.length < mismatches.length) {
                    return nonMatching.map((w) => ({ ...w, line: lineSegment.line })).map(checkFlagWords);
                }
            }
            return mismatches;
        }

        const checkedPossibleWords: Sequence<ValidationResult> = genSequence(
            pipe(
                Text.extractPossibleWordsFromTextOffset(lineSegment.segment),
                opFilter(filterAlreadyChecked),
                opConcatMap(checkPossibleWords)
            )
        );
        return checkedPossibleWords;
    };

    return fn;
}

export function textValidatorFactory(dict: SpellingDictionary, options: ValidationOptions): TextValidator {
    const lineValidator = lineValidatorFactory(dict, options);

    function validator(pText: ParsedText): Iterable<ParsedTextValidationResult> {
        const { text, range: srcRange, map } = pText;
        const srcOffset = srcRange[0];
        const segment = { text, offset: 0 };
        const lineSegment: LineSegment = { line: segment, segment };
        function mapBackToOriginSimple(vr: ValidationResult): ParsedTextValidationResult {
            const { text, offset, isFlagged, isFound } = vr;
            const r = mapRangeBackToOriginalPos([offset, offset + text.length], map);
            const range = [r[0] + srcOffset, r[1] + srcOffset] as [number, number];
            return { text, range, isFlagged, isFound };
        }
        return [...lineValidator(lineSegment)].map(mapBackToOriginSimple);
    }

    return validator;
}
