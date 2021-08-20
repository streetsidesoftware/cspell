import * as Text from './util/text';
import { TextOffset } from './util/text';
import * as TextRange from './util/TextRange';
import { SpellingDictionary, HasOptions } from './SpellingDictionary/SpellingDictionary';
import { Sequence } from 'gensequence';
import * as RxPat from './Settings/RegExpPatterns';
import { split } from './util/wordSplitter';

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
    ignoreRegExpList?: (RegExp | string)[];
    includeRegExpList?: (RegExp | string)[];
}

export interface WordRangeAcc {
    textOffset: Text.TextOffset;
    isIncluded: boolean;
    rangePos: number;
}

export interface ValidationResult extends TextOffset {
    line: TextOffset;
    isFlagged?: boolean;
    isFound?: boolean;
}

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

    const validator = lineValidator(dict, options);

    return Text.extractLinesOfText(text)
        .concatMap(mapTextOffsetsAgainstRanges(includeRanges))
        .concatMap(validator)
        .filter((wo) => {
            const word = wo.text;
            // Keep track of the number of times we have seen the same problem
            const n = (mapOfProblems.get(word) || 0) + 1;
            mapOfProblems.set(word, n);
            // Filter out if there is too many
            return n < maxDuplicateProblems;
        })
        .take(maxNumberOfProblems);
}

export function calcTextInclusionRanges(text: string, options: IncludeExcludeOptions): TextRange.MatchRange[] {
    const { ignoreRegExpList = [], includeRegExpList = [] } = options;

    const filteredIncludeList = includeRegExpList.filter((a) => !!a);
    const finalIncludeList = filteredIncludeList.length ? filteredIncludeList : ['.*'];

    const includeRanges = TextRange.excludeRanges(
        TextRange.findMatchingRangesForPatterns(finalIncludeList, text),
        TextRange.findMatchingRangesForPatterns(ignoreRegExpList, text)
    );
    return includeRanges;
}

type LineValidator = (line: TextOffset) => Sequence<ValidationResult>;

function lineValidator(dict: SpellingDictionary, options: ValidationOptions): LineValidator {
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
        <T extends TextOffset>(fn: (v: T) => boolean) =>
        (v: T) => {
            const keep = fn(v);
            if (!keep) {
                setOfKnownSuccessfulWords.add(v.text);
            }
            return keep;
        };
    const filterAlreadyChecked = (wo: TextOffset) => {
        return !setOfKnownSuccessfulWords.has(wo.text);
    };

    function testForFlaggedWord(wo: TextOffset): boolean {
        const text = wo.text;
        return setOfFlagWords.has(text) || setOfFlagWords.has(text.toLowerCase()) || dictCol.isForbidden(text);
    }

    function isWordIgnored(word: string): boolean {
        return dict.isNoSuggestWord(word, options);
    }

    function checkFlagWords(word: ValidationResult): ValidationResult {
        const isIgnored = isWordIgnored(word.text);
        const isFlagged = !isIgnored && testForFlaggedWord(word);
        word.isFlagged = isFlagged;
        return word;
    }

    function checkWord(word: ValidationResult, options: HasWordOptions): ValidationResult {
        const isIgnored = isWordIgnored(word.text);
        const { isFlagged = !isIgnored && testForFlaggedWord(word) } = word;
        const isFound = isFlagged ? undefined : isIgnored || isWordValid(dictCol, word, word.line, options);
        return { ...word, isFlagged, isFound };
    }

    const fn: LineValidator = (lineSegment: TextOffset) => {
        function splitterIsValid(word: TextOffset): boolean {
            return (
                setOfKnownSuccessfulWords.has(word.text) ||
                (!testForFlaggedWord(word) && isWordValid(dictCol, word, lineSegment, hasWordOptions))
            );
        }

        function checkFullWord(vr: ValidationResult): Iterable<ValidationResult> {
            if (vr.isFlagged) {
                return [vr];
            }

            const codeWordResults = Text.extractWordsFromCodeTextOffset(vr)
                .filter(filterAlreadyChecked)
                .filter(rememberFilter((wo) => wo.text.length >= minWordLength))
                .map((t) => ({ ...t, line: vr.line }))
                .map((wo) => {
                    const vr: ValidationResult = wo;
                    return vr;
                })
                .map((wo) => (wo.isFlagged ? wo : checkWord(wo, hasWordOptions)))
                .filter(rememberFilter((wo) => wo.isFlagged || !wo.isFound))
                .filter(rememberFilter((wo) => !RxPat.regExRepeatedChar.test(wo.text))) // Filter out any repeated characters like xxxxxxxxxx
                // get back the original text.
                .map((wo) => ({
                    ...wo,
                    text: Text.extractText(lineSegment, wo.offset, wo.offset + wo.text.length),
                }))
                .toArray();

            if (!codeWordResults.length || isWordIgnored(vr.text) || checkWord(vr, hasWordOptions).isFound) {
                rememberFilter((_) => false)(vr);
                return [];
            }

            return codeWordResults;
        }

        function checkPossibleWords(possibleWord: TextOffset) {
            const mismatches: ValidationResult[] = Text.extractWordsFromTextOffset(possibleWord)
                .filter(filterAlreadyChecked)
                .filter(rememberFilter((wo) => wo.text.length >= minWordLength))
                .map((wo) => ({ ...wo, line: lineSegment }))
                .map(checkFlagWords)
                .concatMap(checkFullWord)
                .toArray();
            if (mismatches.length) {
                // Try the more expensive word splitter
                const splitResult = split(lineSegment, possibleWord.offset, splitterIsValid);
                const nonMatching = splitResult.words.filter((w) => !w.isFound);
                if (nonMatching.length < mismatches.length) {
                    return nonMatching.map((w) => ({ ...w, line: lineSegment })).map(checkFlagWords);
                }
            }
            return mismatches;
        }

        const checkedPossibleWords: Sequence<ValidationResult> = Text.extractPossibleWordsFromTextOffset(lineSegment)
            .filter(filterAlreadyChecked)
            .concatMap(checkPossibleWords);
        return checkedPossibleWords;
    };

    return fn;
}

export function isWordValid(
    dict: SpellingDictionary,
    wo: Text.TextOffset,
    line: TextOffset,
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
    return {
        ignoreCase,
        useCompounds,
    };
}

/**
 * Returns a mapper function that will
 * @param includeRanges Allowed ranges for words.
 */
function mapTextOffsetsAgainstRanges(includeRanges: TextRange.MatchRange[]): (wo: TextOffset) => Iterable<TextOffset> {
    let rangePos = 0;

    const mapper = (textOffset: TextOffset) => {
        if (!includeRanges.length) {
            return [];
        }
        const parts: TextOffset[] = [];
        const { text, offset } = textOffset;
        const wordEndPos = offset + text.length;
        let wordStartPos = offset;
        while (rangePos && (rangePos >= includeRanges.length || includeRanges[rangePos].startPos > wordStartPos)) {
            rangePos -= 1;
        }

        while (wordStartPos < wordEndPos) {
            while (includeRanges[rangePos] && includeRanges[rangePos].endPos <= wordStartPos) {
                rangePos += 1;
            }
            if (!includeRanges[rangePos] || wordEndPos < includeRanges[rangePos].startPos) {
                break;
            }
            const { startPos, endPos } = includeRanges[rangePos];
            const a = Math.max(wordStartPos, startPos);
            const b = Math.min(wordEndPos, endPos);
            parts.push({ offset: a, text: text.slice(a - offset, b - offset) });
            wordStartPos = b;
        }

        return parts.filter((wo) => !!wo.text);
    };

    return mapper;
}

export const _testMethods = {
    mapWordsAgainstRanges: mapTextOffsetsAgainstRanges,
};
