import * as Text from './util/text';
import { TextOffset } from './util/text';
import * as TextRange from './util/TextRange';
import {
    SpellingDictionary,
    HasOptions,
} from './SpellingDictionary/SpellingDictionary';
import { Sequence } from 'gensequence';
import * as RxPat from './Settings/RegExpPatterns';

export interface ValidationOptions extends IncludeExcludeOptions {
    maxNumberOfProblems?: number;
    maxDuplicateProblems?: number;
    minWordLength?: number;
    // words to always flag as an error
    flagWords?: string[];
    ignoreWords?: string[];
    allowCompoundWords?: boolean;
    caseSensitive?: boolean;
    ignoreCase?: boolean;
}

export interface CheckOptions extends ValidationOptions {
    allowCompoundWords: boolean;
    caseSensitive: boolean;
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

type SetOfWords = Set<string>;

export const defaultMaxNumberOfProblems = 200;
export const defaultMaxDuplicateProblems = 5;
export const defaultMinWordLength = 4;
export const minWordSplitLen = 3;

export function validateText(
    text: string,
    dict: SpellingDictionary,
    options: ValidationOptions
): Sequence<Text.TextOffset> {
    const {
        maxNumberOfProblems = defaultMaxNumberOfProblems,
        maxDuplicateProblems = defaultMaxDuplicateProblems,
    } = options;

    const mapOfProblems = new Map<string, number>();
    const includeRanges = calcTextInclusionRanges(text, options);

    const validator = lineValidator(dict, options);

    return Text.extractLinesOfText(text)
        .concatMap(mapTextOffsetsAgainstRanges(includeRanges))
        .concatMap(validator)
        .filter((wo) => {
            const word = wo.text;
            // Keep track of the number of times we have seen the same problem
            mapOfProblems.set(word, (mapOfProblems.get(word) || 0) + 1);
            // Filter out if there is too many
            return mapOfProblems.get(word)! < maxDuplicateProblems;
        })
        .take(maxNumberOfProblems);
}

export function calcTextInclusionRanges(
    text: string,
    options: IncludeExcludeOptions
): TextRange.MatchRange[] {
    const { ignoreRegExpList = [], includeRegExpList = [] } = options;

    const filteredIncludeList = includeRegExpList.filter((a) => !!a);
    const finalIncludeList = filteredIncludeList.length
        ? filteredIncludeList
        : ['.*'];

    const includeRanges = TextRange.excludeRanges(
        TextRange.findMatchingRangesForPatterns(finalIncludeList, text),
        TextRange.findMatchingRangesForPatterns(ignoreRegExpList, text)
    );
    return includeRanges;
}

type LineValidator = (line: TextOffset) => Sequence<ValidationResult>;

function lineValidator(
    dict: SpellingDictionary,
    options: ValidationOptions
): LineValidator {
    const {
        minWordLength = defaultMinWordLength,
        flagWords = [],
        ignoreWords = [],
        allowCompoundWords = false,
        ignoreCase = true,
        caseSensitive = false,
    } = options;
    const checkOptions: CheckOptions = {
        ...options,
        allowCompoundWords,
        ignoreCase,
        caseSensitive,
    };

    const setOfFlagWords = new Set(flagWords);
    const mappedIgnoreWords = options.caseSensitive
        ? ignoreWords
        : ignoreWords.concat(ignoreWords.map((a) => a.toLowerCase()));
    const ignoreWordsSet: SetOfWords = new Set(mappedIgnoreWords);
    const setOfKnownSuccessfulWords = new Set<string>();
    const rememberFilter = <T extends TextOffset>(fn: (v: T) => boolean) => (
        v: T
    ) => {
        const keep = fn(v);
        if (!keep) {
            setOfKnownSuccessfulWords.add(v.text);
        }
        return keep;
    };
    const filterAlreadyChecked = (wo: TextOffset) => {
        return !setOfKnownSuccessfulWords.has(wo.text);
    };

    function testForFlaggedWord(wo: ValidationResult): boolean {
        return (
            setOfFlagWords.has(wo.text) ||
            setOfFlagWords.has(wo.text.toLowerCase())
        );
    }

    function checkFlagWords(word: ValidationResult): ValidationResult {
        const isFlagged = testForFlaggedWord(word);
        word.isFlagged = isFlagged;
        return word;
    }

    function checkWord(
        word: ValidationResult,
        options: CheckOptions
    ): ValidationResult {
        const isFlagged = testForFlaggedWord(word);
        const isFound = isFlagged
            ? undefined
            : isWordValid(dict, word, word.line, options);
        return { ...word, isFlagged, isFound };
    }

    const fn: LineValidator = (lineSegment: TextOffset) => {
        function checkFullWord(
            vr: ValidationResult
        ): Iterable<ValidationResult> {
            if (vr.isFlagged) {
                return [vr];
            }

            const codeWordResults = Text.extractWordsFromCodeTextOffset(vr)
                .filter(filterAlreadyChecked)
                .filter(rememberFilter((wo) => wo.text.length >= minWordLength))
                .map((t) => ({ ...t, line: vr.line }))
                .map((wo) => {
                    const vr: ValidationResult = {
                        ...wo,
                        text: wo.text.toLowerCase(),
                    };
                    return vr;
                })
                .map((wo) => (wo.isFlagged ? wo : checkWord(wo, checkOptions)))
                .filter(rememberFilter((wo) => wo.isFlagged || !wo.isFound))
                .filter(rememberFilter((wo) => !ignoreWordsSet.has(wo.text)))
                .filter(
                    rememberFilter((wo) => !RxPat.regExHexDigits.test(wo.text))
                ) // Filter out any hex numbers
                .filter(
                    rememberFilter(
                        (wo) => !RxPat.regExRepeatedChar.test(wo.text)
                    )
                ) // Filter out any repeated characters like xxxxxxxxxx
                // get back the original text.
                .map((wo) => ({
                    ...wo,
                    text: Text.extractText(
                        lineSegment,
                        wo.offset,
                        wo.offset + wo.text.length
                    ),
                }))
                .toArray();

            if (
                !codeWordResults.length ||
                ignoreWordsSet.has(vr.text) ||
                checkWord(vr, checkOptions).isFound
            ) {
                rememberFilter((_) => false)(vr);
                return [];
            }

            return codeWordResults;
        }

        // Check the whole words, not yet split
        const checkedWords: Sequence<ValidationResult> = Text.extractWordsFromTextOffset(
            lineSegment
        )
            .filter(filterAlreadyChecked)
            .filter(rememberFilter((wo) => wo.text.length >= minWordLength))
            .map((wo) => ({ ...wo, line: lineSegment }))
            .map(checkFlagWords)
            .concatMap(checkFullWord);
        return checkedWords;
    };

    return fn;
}

export function isWordValid(
    dict: SpellingDictionary,
    wo: Text.TextOffset,
    line: TextOffset,
    options: CheckOptions
) {
    const firstTry = hasWordCheck(dict, wo.text, options);
    return (
        firstTry ||
        // Drop the first letter if it is preceded by a '\'.
        (line.text[wo.offset - line.offset - 1] === '\\' &&
            hasWordCheck(dict, wo.text.slice(1), options))
    );
}

export function hasWordCheck(
    dict: SpellingDictionary,
    word: string,
    options: CheckOptions
) {
    word = word.replace(/\\/g, '');
    // Do not pass allowCompounds down if it is false, that allows for the dictionary to override the value based upon its own settings.
    return dict.has(word, convertCheckOptionsToHasOptions(options));
}

function convertCheckOptionsToHasOptions(opt: CheckOptions): HasOptions {
    const { ignoreCase, allowCompoundWords } = opt;
    return {
        ignoreCase,
        useCompounds: allowCompoundWords || undefined,
    };
}

/**
 * Returns a mapper function that will
 * @param includeRanges Allowed ranges for words.
 */
function mapTextOffsetsAgainstRanges(
    includeRanges: TextRange.MatchRange[]
): (wo: TextOffset) => Iterable<TextOffset> {
    let rangePos = 0;

    const mapper = (textOffset: TextOffset) => {
        if (!includeRanges.length) {
            return [];
        }
        const parts: TextOffset[] = [];
        const { text, offset } = textOffset;
        const wordEndPos = offset + text.length;
        let wordStartPos = offset;
        while (
            rangePos &&
            (rangePos >= includeRanges.length ||
                includeRanges[rangePos].startPos > wordStartPos)
        ) {
            rangePos -= 1;
        }

        while (wordStartPos < wordEndPos) {
            while (
                includeRanges[rangePos] &&
                includeRanges[rangePos].endPos <= wordStartPos
            ) {
                rangePos += 1;
            }
            if (
                !includeRanges[rangePos] ||
                wordEndPos < includeRanges[rangePos].startPos
            ) {
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
