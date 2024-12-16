import assert from 'node:assert';

import { opConcatMap, opFilter, pipe } from '@cspell/cspell-pipe/sync';
import type { ParsedText } from '@cspell/cspell-types';
import { defaultCSpellSettings } from '@cspell/cspell-types';
import type { CachingDictionary, SearchOptions, SpellingDictionary } from 'cspell-dictionary';
import { createCachingDictionary } from 'cspell-dictionary';

import type { ValidationIssue } from '../Models/ValidationIssue.js';
import * as RxPat from '../Settings/RegExpPatterns.js';
import {
    extractPossibleWordsFromTextOffset,
    extractText,
    extractWordsFromTextOffset,
    splitWordWithOffset,
} from '../util/text.js';
import { regExpCamelCaseWordBreaksWithEnglishSuffix } from '../util/textRegex.js';
import { split } from '../util/wordSplitter.js';
import { defaultMinWordLength } from './defaultConstants.js';
import { extractHexSequences, isRandomString } from './isRandomString.js';
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

interface WordStatusInfo {
    word: string;
    isFound: boolean | undefined;
    isFlagged: boolean | undefined;
    isIgnored: boolean | undefined;
    fin: boolean;
}

interface KnownIssuesForWord {
    possibleWord: TextOffsetRO;
    issues: ValidationIssue[];
}

const MIN_HEX_SEQUENCE_LENGTH = 8;

export function lineValidatorFactory(sDict: SpellingDictionary, options: ValidationOptions): LineValidator {
    const {
        minWordLength = defaultMinWordLength,
        flagWords = [],
        allowCompoundWords = false,
        ignoreCase = true,
        ignoreRandomStrings = defaultCSpellSettings.ignoreRandomStrings,
        minRandomLength = defaultCSpellSettings.minRandomLength,
    } = options;
    const hasWordOptions: SearchOptions = {
        ignoreCase,
        useCompounds: allowCompoundWords || undefined, // let the dictionaries decide on useCompounds if allow is false
    };

    const dictCol = createCachingDictionary(sDict, hasWordOptions);

    const knownWords = new Map<string, WordStatusInfo>();

    const setOfFlagWords = new Set(flagWords);
    const setOfKnownIssues = new Map<string, KnownIssuesForWord>();
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

    const hasDict = {
        has(word: string): boolean {
            const info = getWordInfo(word);
            if (info.isFound !== undefined) return info.isFound;
            if (info.isFlagged) return true;
            if (info.isFlagged) return false;
            info.isFound = dictCol.has(word);
            return info.isFound;
        },
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

    const isFlaggedOrMinLength = (wo: ValidationIssue) => wo.text.length >= minWordLength || !!wo.isFlagged;
    const isFlaggedOrNotFound = rememberFilter((wo: ValidationIssue) => wo.isFlagged || !wo.isFound);
    const isNotRepeatingChar = rememberFilter((wo: ValidationIssue) => !RxPat.regExRepeatedChar.test(wo.text));

    function checkWord(issue: ValidationIssue): ValidationIssueRO {
        const info = getWordInfo(issue.text);
        if (info.fin) {
            const { isFlagged: isForbidden, isFound, isIgnored } = info;
            const isFlagged = issue.isFlagged ?? (!isIgnored && isForbidden);
            issue.isFlagged = isFlagged;
            issue.isFound = isFlagged ? undefined : isFound;
            return issue;
        }
        const isIgnored = calcIgnored(info);
        const isFlagged = issue.isFlagged ?? calcFlagged(info);
        info.isFound ??= isFlagged ? false : isIgnored || isWordValidWithEscapeRetry(hasDict, issue, issue.line);
        info.isFlagged = !!isFlagged;
        info.fin = true;
        issue.isFlagged = isFlagged;
        issue.isFound = isFlagged ? undefined : info.isFound;
        return issue;
    }

    const regExUpperCaseWithTrailingCommonEnglishSuffix =
        /^([\p{Lu}\p{M}]{2,})['’]?(?:s|ing|ies|es|ings|ize|ed|ning)$/u; // cspell:disable-line
    const regExpIsLetter = /\p{L}/u;

    const fn: LineValidatorFn = (lineSegment: LineSegment) => {
        const line = lineSegment.line;

        function isWordTooShort(word: TextOffsetRO, ignoreSuffix = false): boolean {
            if (word.text.length >= minWordLength * 2 || [...word.text].length >= minWordLength) return false;
            const offset = word.offset - line.offset;
            assert.equal(line.text.slice(offset, offset + word.text.length), word.text);
            const prefix = [...line.text.slice(Math.max(0, offset - 2), offset)];
            const hasLetterPrefix = !!prefix.length && regExpIsLetter.test(prefix[prefix.length - 1]);
            if (hasLetterPrefix) return false;
            if (ignoreSuffix) return true;
            const suffix = [...line.text.slice(offset + word.text.length, offset + word.text.length + 2)];
            const hasLetterSuffix = !!suffix.length && regExpIsLetter.test(suffix[0]);
            return !hasLetterSuffix;
        }

        function splitterIsValid(word: TextOffsetRO): boolean {
            if (setOfKnownSuccessfulWords.has(word.text)) return true;
            if (isWordFlagged(word)) return false;
            if (isWordValidWithEscapeRetry(hasDict, word, lineSegment.line)) return true;
            if (isWordTooShort(word)) return true;
            return isAllCapsWithTrailingCommonEnglishSuffixOk(word);
        }

        function isAllCapsWithTrailingCommonEnglishSuffixOk(tWord: TextOffsetRO): boolean {
            if (!regExUpperCaseWithTrailingCommonEnglishSuffix.test(tWord.text)) return false;
            const m = tWord.text.match(regExUpperCaseWithTrailingCommonEnglishSuffix);
            if (!m) return false;
            const offset = tWord.offset;
            const v = { offset, text: m[1], line };
            const check = checkWord(v);
            if (check.isFlagged) return false;
            if (check.isFound) return true;
            if (isWordTooShort(v, true)) return true;
            return false;
        }

        function checkFullWord(vr: ValidationIssueRO): Iterable<ValidationIssueRO> {
            if (vr.isFlagged) {
                return [vr];
            }

            // English exceptions :-(
            if (isAllCapsWithTrailingCommonEnglishSuffixOk(vr)) return [];

            if (isWordIgnored(vr.text) || checkWord(vr).isFound) {
                rememberFilter((_) => false)(vr);
                return [];
            }
            if (vr.isFlagged) return [vr];

            const codeWordResults: ValidationIssueRO[] = checkCamelCaseWord(vr);

            if (!codeWordResults.length) {
                rememberFilter((_) => false)(vr);
                return [];
            }

            return codeWordResults;
        }

        /**
         * Break a camel case word into its parts and check each part.
         *
         * There are two word break patterns:
         * - `regExpCamelCaseWordBreaks`
         * - `regExpCamelCaseWordBreaksWithEnglishSuffix` is the default pattern with English suffixes on ALL CAPS words.
         *
         * Note: See [#6066](https://github.com/streetsidesoftware/cspell/pull/6066)
         * Using just `regExpCamelCaseWordBreaks` misses unknown 4-letter words.
         *
         * The code below was tried, but it missed words.
         * - `LSTM` was caught. // cspell:disable-line
         * - `LSTMs` was missed because it becomes `LST` and `Ms`. // cspell:disable-line
         *
         * ```ts
         * const results = _checkCamelCaseWord(vr, regExpCamelCaseWordBreaks);
         * if (!results.length) return results;
         * const resultsEnglishBreaks = _checkCamelCaseWord(vr, regExpCamelCaseWordBreaksWithEnglishSuffix);
         * return results.length < resultsEnglishBreaks.length ? results : resultsEnglishBreaks;
         * ```
         */
        function checkCamelCaseWord(vr: ValidationIssueRO): ValidationIssueRO[] {
            return _checkCamelCaseWord(vr, regExpCamelCaseWordBreaksWithEnglishSuffix);
        }

        function _checkCamelCaseWord(vr: ValidationIssueRO, regExpWordBreaks: RegExp): ValidationIssueRO[] {
            const codeWordResults: ValidationIssueRO[] = [];

            for (const wo of splitWordWithOffset(vr, regExpWordBreaks)) {
                if (setOfKnownSuccessfulWords.has(wo.text)) continue;
                const issue = wo as ValidationIssue;
                issue.line = vr.line;
                issue.isFlagged = undefined;
                issue.isFound = undefined;
                annotateIsFlagged(issue);
                if (!isFlaggedOrMinLength(issue)) continue;
                checkWord(issue);
                if (!isFlaggedOrNotFound(issue) || !isNotRepeatingChar(issue)) continue;
                issue.text = extractText(lineSegment.segment, issue.offset, issue.offset + issue.text.length);
                codeWordResults.push(issue);
            }

            return codeWordResults;
        }

        function rebaseKnownIssues(possibleWord: TextOffsetRO, known: KnownIssuesForWord): ValidationIssue[] {
            const { issues } = known;
            const adjOffset = possibleWord.offset - known.possibleWord.offset;
            return issues.map((issue) => {
                issue = { ...issue };
                issue.offset += adjOffset;
                issue.line = lineSegment.line;
                return issue;
            });
        }

        function checkForFlaggedWord(possibleWord: TextOffsetRO): ValidationIssue | undefined {
            if (isWordFlagged(possibleWord)) {
                const vr: ValidationIssueRO = {
                    ...possibleWord,
                    line: lineSegment.line,
                    isFlagged: true,
                };
                return vr;
            }
            if (possibleWord.text.endsWith('.') && possibleWord.text.length > 1) {
                const pw = { ...possibleWord, text: possibleWord.text.slice(0, -1) };
                if (isWordFlagged(pw)) {
                    const vr: ValidationIssueRO = {
                        ...pw,
                        line: lineSegment.line,
                        isFlagged: true,
                    };
                    return vr;
                }
            }
            return undefined;
        }

        function checkPossibleWords(possibleWord: TextOffsetRO): ValidationIssue[] {
            const known = setOfKnownIssues.get(possibleWord.text);
            if (known) {
                if (!known.issues.length) return known.issues;
                const adjusted = rebaseKnownIssues(possibleWord, known);
                return adjusted;
            }
            const issues = _checkPossibleWords(possibleWord).map(annotateIssue);
            setOfKnownIssues.set(possibleWord.text, { possibleWord, issues });
            return issues;
        }

        function _checkPossibleWords(possibleWord: TextOffsetRO): ValidationIssue[] {
            const flagged = checkForFlaggedWord(possibleWord);
            if (flagged) return [flagged];

            let mismatches: ValidationIssue[] = [];
            for (const wo of extractWordsFromTextOffset(possibleWord)) {
                if (setOfKnownSuccessfulWords.has(wo.text)) continue;
                const issue = wo as ValidationIssue;
                issue.line = lineSegment.line;
                annotateIsFlagged(issue);
                if (!isFlaggedOrMinLength(issue)) continue;
                for (const w of checkFullWord(issue)) {
                    mismatches.push(w);
                }
            }
            if (!mismatches.length) return mismatches;
            const hexSequences = !ignoreRandomStrings
                ? []
                : extractHexSequences(possibleWord.text, MIN_HEX_SEQUENCE_LENGTH)
                      .filter(
                          // Only consider hex sequences that are all upper case or all lower case and contain a `-` or a digit.
                          (w) =>
                              (w.text === w.text.toLowerCase() || w.text === w.text.toUpperCase()) &&
                              /[\d-]/.test(w.text),
                      )
                      .map((w) => ((w.offset += possibleWord.offset), w));
            if (hexSequences.length) {
                mismatches = filterExcludedTextOffsets(mismatches, hexSequences);
            }
            if (mismatches.length) {
                // Try the more expensive word splitter
                const splitResult = split(lineSegment.segment, possibleWord.offset, splitterIsValid);
                const nonMatching = splitResult.words
                    .filter((w) => !w.isFound)
                    .filter((w) => {
                        const m = w.text.match(regExUpperCaseWithTrailingCommonEnglishSuffix);
                        if (!m) return true;
                        const v = checkWord({ ...w, text: m[1], line: lineSegment.line });
                        return v.isFlagged || !v.isFound;
                    });
                const filtered = filterExcludedTextOffsets(
                    nonMatching.map((w) => ({ ...w, line: lineSegment.line })).map(annotateIsFlagged),
                    hexSequences,
                );
                if (filtered.length < mismatches.length) {
                    return filtered;
                }
            }
            return mismatches;
        }

        function isNotRandom(textOff: TextOffsetRO): boolean {
            if (textOff.text.length < minRandomLength || !ignoreRandomStrings) return true;
            return !isRandomString(textOff.text);
        }

        const checkedPossibleWords: Iterable<ValidationIssue> = pipe(
            extractPossibleWordsFromTextOffset(lineSegment.segment),
            opFilter(isNotRandom),
            opFilter(filterAlreadyChecked),
            opConcatMap(checkPossibleWords),
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

function filterExcludedTextOffsets(issues: ValidationIssue[], excluded: TextOffsetRO[]): ValidationIssue[] {
    if (!excluded.length) return issues;
    const keep: ValidationIssue[] = [];
    let i = 0;
    let j = 0;
    for (i = 0; i < issues.length && j < excluded.length; i++) {
        const issue = issues[i];
        while (j < excluded.length && excluded[j].offset + excluded[j].text.length <= issue.offset) {
            j++;
        }
        if (j >= excluded.length) {
            break;
        }
        if (issue.isFlagged || issue.offset < excluded[j].offset) {
            keep.push(issue);
        }
    }
    if (i < issues.length) {
        keep.push(...issues.slice(i));
    }

    return keep;
}
