import { opConcatMap, opFilter, opTake, pipeSync as pipe } from '@cspell/cspell-pipe';
import { genSequence, Sequence } from 'gensequence';
import { SpellingDictionary } from '../SpellingDictionary/SpellingDictionaryLibOld/SpellingDictionary';
import * as Text from '../util/text';
import * as TextRange from '../util/TextRange';
import { lineValidatorFactory } from './lineValidatorFactory';
import {
    IncludeExcludeOptions,
    LineSegment,
    TextOffsetRO,
    ValidationOptions,
    ValidationResult,
} from './ValidationTypes';

export const defaultMaxNumberOfProblems = 200;
export const defaultMaxDuplicateProblems = 5;
export const defaultMinWordLength = 4;
export const minWordSplitLen = 3;

/**
 * @deprecated
 * @deprecation Use spellCheckDocument
 */
export function validateText(
    text: string,
    dict: SpellingDictionary,
    options: ValidationOptions
): Sequence<ValidationResult> {
    const { maxNumberOfProblems = defaultMaxNumberOfProblems, maxDuplicateProblems = defaultMaxDuplicateProblems } =
        options;

    const mapOfProblems = new Map<string, number>();
    const includeRanges = calcTextInclusionRanges(text, options);

    const lineValidator = lineValidatorFactory(dict, options);
    const validator = lineValidator.fn;

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
