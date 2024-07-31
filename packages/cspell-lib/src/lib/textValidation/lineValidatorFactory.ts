import { opConcatMap, opFilter, opMap, pipe, toArray } from '@cspell/cspell-pipe/sync';
import type { ParsedText } from '@cspell/cspell-types';
import type { CachingDictionary, SearchOptions, SpellingDictionary } from 'cspell-dictionary';
import { createCachingDictionary } from 'cspell-dictionary';

import type { ValidationIssue } from '../Models/ValidationIssue.js';
import * as RxPat from '../Settings/RegExpPatterns.js';
import * as Text from '../util/text.js';
import { split } from '../util/wordSplitter.js';
import { defaultMinWordLength } from './defaultConstants.js';
import { isWordValidWithEscapeRetry } from './isWordValid.js';
import { mapRangeBackToOriginalPos } from './parsedText.js';
import type {
    LineSegment,
    LineValidatorFn,
    MappedTextValidationResult,
    TextOffsetRO,
    TextOffsetRW,
    TextValidatorFn,
    ValidationIssueRO,
    ValidationOptions,
} from './ValidationTypes.js';

interface LineValidator {
    fn: LineValidatorFn;
    dict: CachingDictionary;
}

interface TextOffsetWithLine extends TextOffsetRW {
    line?: TextOffsetRO;
}

interface WordStatusInfo {
    word: string;
    isFound: boolean | undefined;
    isFlagged: boolean | undefined;
    isIgnored: boolean | undefined;
    fin: boolean;
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

    const knownWords = new Map<string, WordStatusInfo>();

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

    function calcIgnored(info: WordStatusInfo): boolean {
        info.isIgnored ??= dictCol.isNoSuggestWord(info.word);
        return info.isIgnored;
    }

    function calcFlagged(info: WordStatusInfo): boolean {
        if (info.isFlagged !== undefined) return info.isFlagged;
        const word = info.word;
        info.isFlagged =
            (setOfFlagWords.has(word) || setOfFlagWords.has(word.toLowerCase()) || dictCol.isForbidden(word)) &&
            !calcIgnored(info);
        return info.isFlagged;
    }

    function isWordIgnored(word: string): boolean {
        return calcIgnored(getWordInfo(word));
    }

    function getSuggestions(word: string) {
        return dictCol.getPreferredSuggestions(word);
    }

    function isWordFlagged(wo: TextOffsetRO): boolean {
        return calcFlagged(getWordInfo(wo.text));
    }

    function annotateIsFlagged(word: ValidationIssue): ValidationIssue {
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

    function checkWord(issue: ValidationIssue): ValidationIssueRO {
        const info = getWordInfo(issue.text);
        if (info.fin) {
            const { isFlagged: isForbidden, isFound, isIgnored } = info;
            const isFlagged = issue.isFlagged ?? (!isIgnored && isForbidden);
            issue.isFlagged = isFlagged;
            issue.isFound = isFound;
            return issue;
        }
        const isIgnored = calcIgnored(info);
        const isFlagged = issue.isFlagged ?? calcFlagged(info);
        const isFound = isFlagged ? undefined : isIgnored || isWordValidWithEscapeRetry(dictCol, issue, issue.line);
        info.isFlagged = !!isFlagged;
        info.isFound = isFound;
        info.fin = true;
        issue.isFlagged = isFlagged;
        issue.isFound = isFound;
        return issue;
    }

    const fn: LineValidatorFn = (lineSegment: LineSegment) => {
        function splitterIsValid(word: TextOffsetRO): boolean {
            return (
                setOfKnownSuccessfulWords.has(word.text) ||
                (!isWordFlagged(word) && isWordValidWithEscapeRetry(dictCol, word, lineSegment.line))
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
                    opMap((t) => ({ ...t, line: vr.line, isFlagged: undefined, isFound: undefined })),
                    opMap(annotateIsFlagged),
                    // Filter out words that are too short, except for flagged words.
                    opFilter(rememberFilter((wo) => wo.text.length >= minWordLength || !!wo.isFlagged)),
                    opMap((wo) => checkWord(wo)),
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
                    opFilter((wo: TextOffsetWithLine) => filterAlreadyChecked(wo)),
                    opMap((wo: TextOffsetWithLine) => ((wo.line = lineSegment.line), wo as ValidationIssue)),
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

    function getWordInfo(word: string): WordStatusInfo {
        const info = knownWords.get(word);
        if (info) return info;
        const result = { word, isFound: undefined, isFlagged: undefined, isIgnored: undefined, fin: false };
        knownWords.set(word, result);
        return result;
    }

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
