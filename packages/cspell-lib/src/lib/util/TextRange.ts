import * as GS from 'gensequence';

export interface MatchRange {
    startPos: number;
    endPos: number;
}

export interface MatchRangeWithText extends MatchRange {
    text: string;
}

export interface MatchRangeOptionalText extends MatchRange {
    text?: string;
}

function toMatchRangeWithText(m: RegExpMatchArray): MatchRangeWithText {
    const index = m.index || 0;
    const _text = m[0];
    return {
        startPos: index,
        endPos: index + _text.length,
        text: _text,
    };
}

export function findMatchingRanges(pattern: RegExp, text: string): MatchRangeOptionalText[] {
    if (pattern.source === '.*') {
        return [{ startPos: 0, endPos: text.length }];
    }

    const regex = new RegExp(pattern);
    if (!regex.global) {
        const m = text.match(regex);
        if (!m) return [];
        return [toMatchRangeWithText(m)];
    }
    return [...text.matchAll(regex)].map(toMatchRangeWithText);
}

function compareRanges(a: MatchRange, b: MatchRange) {
    return a.startPos - b.startPos || a.endPos - b.endPos;
}

export function unionRanges(ranges: MatchRange[]): MatchRange[] {
    return makeSortedMatchRangeArray([..._unionRanges(ranges)]);
}

function* _unionRanges(ranges: MatchRange[]): Generator<MatchRange> {
    const sortedRanges = sortMatchRangeArray(ranges);

    if (!sortedRanges.length) return;

    let { startPos, endPos } = sortedRanges[0];

    for (const r of ranges) {
        if (r.startPos > endPos) {
            yield { startPos, endPos };
            startPos = r.startPos;
            endPos = r.endPos;
            continue;
        }
        endPos = Math.max(endPos, r.endPos);
    }
    if (startPos < endPos) {
        yield { startPos, endPos };
    }
}

export function findMatchingRangesForPatterns(patterns: RegExp[], text: string): MatchRange[] {
    const matchedPatterns = GS.genSequence(patterns).concatMap((pattern) => findMatchingRanges(pattern, text));
    return unionRanges(matchedPatterns.toArray());
}

/**
 * Create a new set of positions that have the excluded position ranges removed.
 */
export function excludeRanges(includeRanges: MatchRange[], excludeRanges: MatchRange[]): MatchRange[] {
    return [..._excludeRanges(sortMatchRangeArray(includeRanges), sortMatchRangeArray(excludeRanges))];
}

function* _excludeRanges(
    includeRanges: SortedMatchRangeArray,
    excludeRanges: SortedMatchRangeArray
): Generator<MatchRange, undefined, undefined> {
    if (!includeRanges.length) return;
    if (!excludeRanges.length) {
        yield* includeRanges;
        return;
    }

    let exIndex = 0;
    const limit = excludeRanges.length;

    for (const incRange of includeRanges) {
        const endPos = incRange.endPos;
        let startPos = incRange.startPos;

        for (; exIndex < limit; ++exIndex) {
            const ex = excludeRanges[exIndex];
            if (ex.startPos >= endPos) break;
            if (ex.endPos <= startPos) continue;
            if (ex.startPos > startPos) {
                yield { startPos, endPos: ex.startPos };
            }
            startPos = ex.endPos;
            if (startPos >= endPos) break;
        }

        if (startPos < endPos) {
            yield { startPos, endPos };
        }
    }
}

export function extractRangeText(text: string, ranges: MatchRange[]): MatchRangeWithText[] {
    return ranges.map(({ startPos, endPos }) => ({
        startPos,
        endPos,
        text: text.slice(startPos, endPos),
    }));
}

const SymSortedMatchRangeArray = Symbol('SortedMatchRangeArray');

interface SortedMatchRangeArray extends Array<MatchRange> {
    [SymSortedMatchRangeArray]: true;
}

function sortMatchRangeArray(values: MatchRange[]): SortedMatchRangeArray {
    if (isSortedMatchRangeArray(values)) return values;

    return makeSortedMatchRangeArray(values.sort(compareRanges));
}

function isSortedMatchRangeArray(a: MatchRange[] | SortedMatchRangeArray): a is SortedMatchRangeArray {
    return (<SortedMatchRangeArray>a)[SymSortedMatchRangeArray] === true;
}

function makeSortedMatchRangeArray(sortedValues: MatchRange[]): SortedMatchRangeArray {
    const sorted: SortedMatchRangeArray = sortedValues as SortedMatchRangeArray;
    sorted[SymSortedMatchRangeArray] = true;
    Object.freeze(sorted);
    return sorted;
}

export const __testing__ = {
    makeSortedMatchRangeArray,
};
