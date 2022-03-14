import { opConcatMap, opFilter, opMap, pipeSync as pipe, toArray, opTake } from '@cspell/cspell-pipe';
import type { TextOffset as TextOffsetRW } from '@cspell/cspell-types';
import { genSequence, Sequence } from 'gensequence';
import * as RxPat from '../Settings/RegExpPatterns';
import { HasOptions, SpellingDictionary } from '../SpellingDictionary/SpellingDictionary';
import * as Text from '../util/text';
import * as TextRange from '../util/TextRange';
import { clean } from '../util/util';
import { split } from '../util/wordSplitter';

type TextOffsetRO = Readonly<TextOffsetRW>;

export interface ValidationOptions extends IncludeExcludeOptions {
    maxNumberOfProblems?: number;
    maxDuplicateProblems?: number;
    minWordLength?: number;
    // words to always flag as an error
    flagWords?: string[];
    allowCompoundWords?: boolean;
    /** ignore case when checking words against dictionary or ignore words list */
    ignoreCase: boolean;
}

export interface CheckOptions extends ValidationOptions {
    allowCompoundWords: boolean;
    ignoreCase: boolean;
}

export interface IncludeExcludeOptions {
    ignoreRegExpList?: RegExp[];
    includeRegExpList?: RegExp[];
}

export interface WordRangeAcc {
    textOffset: TextOffsetRO;
    isIncluded: boolean;
    rangePos: number;
}

export interface ValidationResult extends TextOffsetRW {
    line: TextOffsetRW;
    isFlagged?: boolean;
    isFound?: boolean;
}

type ValidationResultRO = Readonly<ValidationResult>;

export const defaultMaxNumberOfProblems = 200;
export const defaultMaxDuplicateProblems = 5;
export const defaultMinWordLength = 4;
export const minWordSplitLen = 3;

export function validateText(
    text: string,
    dict: SpellingDictionary,
    options: ValidationOptions
): Sequence<ValidationResult> {
    const { maxNumberOfProblems = defaultMaxNumberOfProblems, maxDuplicateProblems = defaultMaxDuplicateProblems } =
        options;

    const mapOfProblems = new Map<string, number>();
    const includeRanges = calcTextInclusionRanges(text, options);

    const validator = lineValidatorFactory(dict, options);

    const iter = pipe(
        Text.extractLinesOfText(text),
        opConcatMap(mapLineToLineSegments(includeRanges)),
        opConcatMap(validator),
        opFilter((wo) => {
            const word = wo.text;
            // Keep track of the number of times we have seen the same problem
            const n = (mapOfProblems.get(word) || 0) + 1;
            mapOfProblems.set(word, n);
            // Filter out if there is too many
            return n <= maxDuplicateProblems;
        }),
        opTake(maxNumberOfProblems)
    );

    return genSequence(iter);
}

export function calcTextInclusionRanges(text: string, options: IncludeExcludeOptions): TextRange.MatchRange[] {
    const { ignoreRegExpList = [], includeRegExpList = [] } = options;

    const filteredIncludeList = includeRegExpList.filter((a) => !!a);
    const finalIncludeList = filteredIncludeList.length ? filteredIncludeList : [/.*/gim];

    const includeRanges = TextRange.excludeRanges(
        TextRange.findMatchingRangesForPatterns(finalIncludeList, text),
        TextRange.findMatchingRangesForPatterns(ignoreRegExpList, text)
    );
    return includeRanges;
}

export interface LineSegment {
    line: TextOffsetRO;
    segment: TextOffsetRO;
}

export type LineValidator = (line: LineSegment) => Iterable<ValidationResult>;

export function lineValidatorFactory(dict: SpellingDictionary, options: ValidationOptions): LineValidator {
    const {
        minWordLength = defaultMinWordLength,
        flagWords = [],
        allowCompoundWords = false,
        ignoreCase = true,
    } = options;
    const hasWordOptions: HasWordOptions = {
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

    function checkWord(word: ValidationResultRO, options: HasWordOptions): ValidationResultRO {
        const isIgnored = isWordIgnored(word.text);
        const { isFlagged = !isIgnored && testForFlaggedWord(word) } = word;
        const isFound = isFlagged ? undefined : isIgnored || isWordValid(dictCol, word, word.line, options);
        return clean({ ...word, isFlagged, isFound });
    }

    const fn: LineValidator = (lineSegment: LineSegment) => {
        function splitterIsValid(word: TextOffsetRO): boolean {
            return (
                setOfKnownSuccessfulWords.has(word.text) ||
                (!testForFlaggedWord(word) && isWordValid(dictCol, word, lineSegment.line, hasWordOptions))
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
                    opFilter(rememberFilter((wo) => !RxPat.regExRepeatedChar.test(wo.text))), // Filter out any repeated characters like xxxxxxxxxx
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

export function isWordValid(
    dict: SpellingDictionary,
    wo: TextOffsetRO,
    line: TextOffsetRO,
    options: HasWordOptions
): boolean {
    const firstTry = hasWordCheck(dict, wo.text, options);
    return (
        firstTry ||
        // Drop the first letter if it is preceded by a '\'.
        (line.text[wo.offset - line.offset - 1] === '\\' && hasWordCheck(dict, wo.text.slice(1), options))
    );
}

export interface HasWordOptions {
    ignoreCase: boolean;
    useCompounds: boolean | undefined;
}

export function hasWordCheck(dict: SpellingDictionary, word: string, options: HasWordOptions): boolean {
    word = word.replace(/\\/g, '');
    // Do not pass allowCompounds down if it is false, that allows for the dictionary to override the value based upon its own settings.
    return dict.has(word, convertCheckOptionsToHasOptions(options));
}

function convertCheckOptionsToHasOptions(opt: HasWordOptions): HasOptions {
    const { ignoreCase, useCompounds } = opt;
    return clean({
        ignoreCase,
        useCompounds,
    });
}

function mapLineToLineSegments(includeRanges: TextRange.MatchRange[]): (line: TextOffsetRO) => LineSegment[] {
    const mapAgainstRanges = mapLineSegmentAgainstRangesFactory(includeRanges);

    return (line: TextOffsetRO) => {
        const segment = { line, segment: line };
        return mapAgainstRanges(segment);
    };
}

/**
 * Returns a mapper function that will segment a TextOffset based upon the includeRanges.
 * This function is optimized for forward scanning. It will perform poorly for randomly ordered offsets.
 * @param includeRanges Allowed ranges for words.
 */
export function mapLineSegmentAgainstRangesFactory(
    includeRanges: TextRange.MatchRange[]
): (lineSeg: LineSegment) => LineSegment[] {
    let rangePos = 0;

    const mapper = (lineSeg: LineSegment) => {
        if (!includeRanges.length) {
            return [];
        }
        const parts: LineSegment[] = [];
        const { segment, line } = lineSeg;
        const { text, offset, length } = segment;
        const textEndPos = offset + (length ?? text.length);
        let textStartPos = offset;
        while (rangePos && (rangePos >= includeRanges.length || includeRanges[rangePos].startPos > textStartPos)) {
            rangePos -= 1;
        }

        const cur = includeRanges[rangePos];
        if (textEndPos <= cur.endPos && textStartPos >= cur.startPos) {
            return [lineSeg];
        }

        while (textStartPos < textEndPos) {
            while (includeRanges[rangePos] && includeRanges[rangePos].endPos <= textStartPos) {
                rangePos += 1;
            }
            if (!includeRanges[rangePos]) {
                break;
            }
            const { startPos, endPos } = includeRanges[rangePos];
            if (textEndPos < startPos) {
                break;
            }
            const a = Math.max(textStartPos, startPos);
            const b = Math.min(textEndPos, endPos);
            if (a !== b) {
                parts.push({ line, segment: { offset: a, text: text.slice(a - offset, b - offset) } });
            }
            textStartPos = b;
        }

        return parts;
    };

    return mapper;
}

export const _testMethods = {
    mapWordsAgainstRanges: mapLineSegmentAgainstRangesFactory,
};
