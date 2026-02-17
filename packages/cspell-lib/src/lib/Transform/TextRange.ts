/**
 * A range of text in a document.
 * The range is inclusive of the startPos and exclusive of the endPos.
 */
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

export function unionRanges(ranges: MatchRange[]): SortedMatchRangeArray {
    const sortedRanges = sortMatchRangeArray(ranges);

    ranges = sortedRanges.values;

    if (!ranges.length) return sortedRanges;

    let i = 0;
    let j = 0;
    let { startPos, endPos } = ranges[i++];

    for (; i < ranges.length; ++i) {
        const r = ranges[i];
        if (r.startPos > endPos) {
            ranges[j++] = { startPos, endPos };
            startPos = r.startPos;
            endPos = r.endPos;
            continue;
        }
        endPos = Math.max(endPos, r.endPos);
    }
    if (startPos < endPos) {
        ranges[j++] = { startPos, endPos };
    }
    ranges.length = j;
    return sortedRanges;
}

export function findMatchingRangesForPatterns(patterns: RegExp[], text: string): MatchRange[] {
    const nested = patterns.map((pattern) => findMatchingRanges(pattern, text));

    return unionRanges(flatten(nested)).values;
}

/**
 * Create a new set of positions that have the excluded position ranges removed.
 */
export function excludeRanges(includeRanges: MatchRange[], excludeRanges: MatchRange[]): MatchRange[] {
    return _excludeRanges(sortMatchRangeArray(includeRanges), sortMatchRangeArray(excludeRanges));
}

function _excludeRanges(
    sortedIncludeRanges: SortedMatchRangeArray,
    sortedExcludeRanges: SortedMatchRangeArray,
): MatchRange[] {
    const includeRanges = sortedIncludeRanges.values;
    const excludeRanges = sortedExcludeRanges.values;
    if (!includeRanges.length) return includeRanges;
    if (!excludeRanges.length) {
        return includeRanges;
    }

    const ranges: MatchRange[] = [];
    ranges.length = includeRanges.length + excludeRanges.length + 1;

    let i = 0;

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
                ranges[i++] = { startPos, endPos: ex.startPos };
            }
            startPos = ex.endPos;
            if (startPos >= endPos) break;
        }

        if (startPos < endPos) {
            ranges[i++] = { startPos, endPos };
        }
    }

    ranges.length = i;
    return ranges;
}

export function extractRangeText(text: string, ranges: MatchRange[]): MatchRangeWithText[] {
    return ranges.map(({ startPos, endPos }) => ({
        startPos,
        endPos,
        text: text.slice(startPos, endPos),
    }));
}

interface SortedMatchRangeArray {
    values: MatchRange[];
}

function sortMatchRangeArray(values: MatchRange[]): SortedMatchRangeArray {
    values.sort(compareRanges);
    return { values };
}

function flatten<T>(data: T[][]): T[] {
    let size = 0;
    for (let i = data.length - 1; i >= 0; --i) {
        size += data[i].length;
    }
    const result = new Array<T>(size);
    let k = 0;
    for (let i = 0; i < data.length; ++i) {
        const d = data[i];
        for (let j = 0; j < d.length; ++j) {
            result[k++] = d[j];
        }
    }
    return result;
}
