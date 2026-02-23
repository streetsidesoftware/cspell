import assert from 'node:assert';

import type { Range, SourceMap } from '@cspell/cspell-types';

export interface SourceMapCursor {
    /**
     * The source map being traversed.
     */
    readonly sourceMap: SourceMap;
    /**
     * The current index in the source map.
     */
    readonly idx: number;
    /**
     * The base offset in the source text.
     */
    readonly begin0: number;
    /**
     * The base offset in the transformed text.
     */
    readonly begin1: number;

    reset(): void;

    mapOffsetToDest(offsetInSrc: number): number;
    mapOffsetToSrc(offsetInDst: number): number;
}

class SourceMapCursorImpl implements SourceMapCursor {
    sourceMap: SourceMap;
    idx: number;
    begin0: number;
    begin1: number;
    /**
     * The delta in the source
     */
    d0: number;
    /**
     * The delta in the transformed text.
     */
    d1: number;
    /**
     * Indicates whether the current segment is linear (1:1) or non-linear.
     * A linear segment has equal deltas in the source and transformed text,
     * while a non-linear segment has different deltas.
     * It is possible that a non-linear segment has the same deltas,
     * but it is not possible for a linear segment to have different deltas.
     */
    linear: boolean;
    /**
     * indicates that the cursor has reached the end of the source map.
     */
    done: boolean;

    constructor(sourceMap: SourceMap) {
        this.sourceMap = sourceMap;
        this.idx = -2;
        this.begin0 = 0;
        this.begin1 = 0;
        this.d0 = 0;
        this.d1 = 0;
        this.linear = true;
        this.done = false;
        this.next();
    }

    next(): boolean {
        if (this.done) return false;
        this.idx += 2;
        this.begin0 += this.d0;
        this.begin1 += this.d1;
        this.d0 = this.sourceMap[this.idx] || 0;
        this.d1 = this.sourceMap[this.idx + 1] || 0;
        this.linear = this.d0 === this.d1;
        this.done = this.idx >= this.sourceMap.length;
        if (this.d0 === 0 && this.d1 === 0 && !this.done) {
            this.next();
            this.linear = this.done;
        }
        return !this.done;
    }

    mapOffsetToDest(offsetInSrc: number): number {
        if (offsetInSrc < this.begin0) this.reset();
        while (!this.done && offsetInSrc >= this.begin0 + this.d0) {
            this.next();
        }
        if (this.linear) {
            return offsetInSrc - this.begin0 + this.begin1;
        }
        // For a non-linear segment, the offset in the source maps to the start of the segment in the transformed text.
        return this.begin1;
    }

    mapOffsetToSrc(offsetInDst: number): number {
        if (offsetInDst < this.begin1) this.reset();
        while (!this.done && offsetInDst >= this.begin1 + this.d1) {
            this.next();
        }
        if (this.linear) {
            return offsetInDst - this.begin1 + this.begin0;
        }
        // For a non-linear segment, the offset in the source maps to the start of the segment in the transformed text.
        return this.begin0;
    }

    reset(): void {
        this.idx = -2;
        this.begin0 = 0;
        this.begin1 = 0;
        this.next();
    }
}

/**
 * Create a cursor for traversing a source map.
 * @param sourceMap - The source map to create the cursor for. The map must be pairs of values (even, odd).
 * @returns A cursor initialized to the start of the source map. The cursor can be used to traverse the source map and
 *   calculate offsets in the transformed text based on offsets in the source text.
 */
export function createSourceMapCursor(sourceMap: SourceMap): SourceMapCursorImpl;
export function createSourceMapCursor(sourceMap: SourceMap | undefined): SourceMapCursorImpl | undefined;
export function createSourceMapCursor(sourceMap: SourceMap | undefined): SourceMapCursorImpl | undefined {
    if (!sourceMap) return undefined;

    assert((sourceMap.length & 1) === 0, 'Map must be pairs of values.');
    return new SourceMapCursorImpl(sourceMap);
}

/**
 * Calculated the transformed offset in the destination text based on the source map and the offset in the source text.
 * @param cursor - The cursor to use for the mapping. If undefined or empty, the input offset is returned, assuming it is a 1:1 mapping.
 * @param offsetInSrc - the offset in the source text to map to the transformed text. The offset is relative to the start of the text range.
 * @returns The offset in the transformed text corresponding to the input offset in the source text. The offset is relative to the start of the text range.
 */
export function calcOffsetInDst(cursor: SourceMapCursor | undefined, offsetInSrc: number): number {
    if (!cursor?.sourceMap.length) {
        return offsetInSrc;
    }

    return cursor.mapOffsetToDest(offsetInSrc);
}

/**
 * Calculated the transformed offset in the source text based on the source map and the offset in the transformed text.
 * @param cursor - The cursor to use for the mapping. If undefined or empty, the input offset is returned, assuming it is a 1:1 mapping.
 * @param offsetInDst - the offset in the transformed text to map to the source text. The offset is relative to the start of the text range.
 * @returns The offset in the source text corresponding to the input offset in the transformed text. The offset is relative to the start of the text range.
 */
export function calcOffsetInSrc(cursor: SourceMapCursor | undefined, offsetInDst: number): number {
    if (!cursor?.sourceMap.length) {
        return offsetInDst;
    }

    return cursor.mapOffsetToSrc(offsetInDst);
}

/**
 * Map offset pairs to a source map. The input map is expected to be pairs of absolute offsets in the source and transformed text.
 * The output map is pairs of lengths.
 * @param map - The input map to convert. The map must be pairs of values (even, odd) where the even values are offsets in the source
 *   text and the odd values are offsets in the transformed text. The offsets are absolute offsets from the start of the text range.
 * @returns a SourceMap
 */
export function mapOffsetPairsToSourceMap(map: number[] | undefined): SourceMap | undefined {
    if (!map) return undefined;
    assert((map.length & 1) === 0, 'Map must be pairs of values.');
    const srcMap: number[] = [];
    let base0 = 0;
    let base1 = 0;
    for (let i = 0; i < map.length; i += 2) {
        const d0 = map[i] - base0;
        const d1 = map[i + 1] - base1;
        base0 += d0;
        base1 += d1;
        if (d0 === 0 && d1 === 0) continue;
        srcMap.push(d0, d1);
    }
    return srcMap;
}

/**
 * Merge two source maps into a single source map. The first map transforms from the
 * original text to an intermediate text, and the second map transforms from the intermediate
 * text to the final text. The resulting map represents the transformation directly from the
 * original text to the final text.
 *
 * Concept:
 * [markdown codeblock] -> <first map> -> [JavaScript code] -> <second map> -> [string value]
 *
 * Some kinds of transforms:
 * - markdown code block extraction
 * - unicode normalization
 * - html entity substitution
 * - url decoding
 * - etc.
 *
 * The result of each transform is a {@link SourceMap}. When multiple transforms are applied,
 * the source maps can be merged to create a single map that represents the cumulative effect
 * of all transforms. This is useful for accurately mapping positions in the final transformed
 * text back to their corresponding positions in the original text, which is essential for
 * reporting spelling issues in the correct context.
 *
 * @param first - The first transformation map from the original text to the intermediate.
 * @param second - The second transformation map from the intermediate, to the final text.
 */
export function mergeSourceMaps(first: SourceMap | undefined, second: SourceMap | undefined): SourceMap | undefined {
    if (!second?.length) return first?.length ? first : undefined;
    if (!first?.length) return second?.length ? second : undefined;

    assert((first.length & 1) === 0, 'First map must be pairs of values.');
    assert((second.length & 1) === 0, 'Second map must be pairs of values.');

    const result: SourceMap = [];

    const cursor1 = new SourceMapMergeCursor(first);
    const cursor2 = new SourceMapMergeCursor(second);

    while (advanceCursors(cursor1, cursor2, result)) {
        // empty
    }

    return result;
}

class SourceMapMergeCursor {
    sourceMap: SourceMap;
    idx: number;
    begin0: number;
    begin1: number;
    end0: number;
    end1: number;
    /**
     * The last position emitted in the source text.
     */
    p0: number;
    /**
     * The last position emitted in the transformed text.
     */
    p1: number;
    /**
     * The delta in the source
     */
    d0: number;
    /**
     * The delta in the transformed text.
     */
    d1: number;
    /**
     * Indicates whether the current segment is linear (1:1) or non-linear.
     * A linear segment has equal deltas in the source and transformed text,
     * while a non-linear segment has different deltas.
     * It is possible that a non-linear segment has the same deltas,
     * but it is not possible for a linear segment to have different deltas.
     */
    linear: boolean;
    /**
     * indicates that the cursor has reached the end of the source map.
     */
    done: boolean;

    constructor(sourceMap: SourceMap, idx: number = 0) {
        this.sourceMap = sourceMap;
        this.idx = idx;
        this.begin0 = 0;
        this.begin1 = 0;
        this.p0 = 0;
        this.p1 = 0;
        this.d0 = this.sourceMap[this.idx] || 0;
        this.d1 = this.sourceMap[this.idx + 1] || 0;
        this.end0 = this.begin0 + this.d0;
        this.end1 = this.begin1 + this.d1;
        this.linear = this.d0 === this.d1;
        const forceNonLinear = this.d0 === 0 && this.d1 === 0;
        this.done = this.idx >= this.sourceMap.length;
        if (forceNonLinear) {
            this.next(false);
            this.linear = this.done;
        }
    }

    /**
     *
     * @param moveP - Reset the current position.
     * @returns true if not done.
     */
    next(moveP: boolean): boolean {
        if (this.done) {
            if (moveP) {
                this.p0 = this.end0;
                this.p1 = this.end1;
            }
            return false;
        }
        this.idx += 2;
        this.begin0 += this.d0;
        this.begin1 += this.d1;
        if (moveP) {
            this.p0 = this.begin0;
            this.p1 = this.begin1;
        }
        this.d0 = this.sourceMap[this.idx] || 0;
        this.d1 = this.sourceMap[this.idx + 1] || 0;
        this.end0 = this.begin0 + this.d0;
        this.end1 = this.begin1 + this.d1;
        this.linear = this.d0 === this.d1;
        const forceNonLinear = this.d0 === 0 && this.d1 === 0;
        this.done = this.idx >= this.sourceMap.length;
        if (forceNonLinear) {
            this.next(false);
            this.linear = this.done;
        }
        return !this.done;
    }
}

/**
 * Advance one or both cursors to the next position in their respective source maps and push the corresponding delta pair(s) to the target map.
 * The function compares the end positions of the two cursors and advances the cursor(s) that have the smaller end position.
 * If both cursors have the same end position, both are advanced.
 * The delta pair(s) pushed to the target map represent the change in offsets from the current position to the next position in the source map(s).
 *
 * Cursor1 represents the transformation from A to B, and Cursor2 represents the transformation from B to C.
 * The target map represents the transformation from A to C. B is the shared edge between the two transformations.
 *
 * - A - cursor1.0
 * - B - cursor1.1 and cursor2.0. <- shared edge
 * - C - cursor2.1
 *
 * There are twelve cases to consider when advancing the cursors.
 *
 * ```
 *     Linear     Shared End. C0 < C1   C0 > C1
 * C0  *---*      ?~~~*       ?~~*      ?~~~*
 * C1  *---*      ?~~~*       ?~~~*     ?~~*
 *
 * C0  *---*      ?~~~*       ?~~*      ?~~~*
 * C1  *--*       ?---*       ?---*     ?--*
 *
 * C0  *--*       ?---*       ?--*      ?---*
 * C1  *---*      ?~~~*       ?~~~*     ?~~*
 *
 * ```
 * - `-` represents a linear segment where the deltas in the source and transformed text are equal.
 * - `~` represents a non-linear segment where the deltas in the source and transformed text are different.
 *
 * @param cursor1 - The cursor for the first transformation map from source to intermediate.
 * @param cursor2 - The cursor for the second transformation map from intermediate to destination.
 * @param target - The target source map from source to destination to push the delta pair(s) to.
 * @return true if there is more work to do, false if both cursors are at the end of their respective source maps.
 */
function advanceCursors(cursor1: SourceMapMergeCursor, cursor2: SourceMapMergeCursor, target: SourceMap): boolean {
    if (cursor1.done) {
        const adjA = cursor1.end0 - cursor1.p0;
        const adjB = cursor1.end1 - cursor1.p1;
        const adjustment = adjA - adjB;
        const dA = cursor2.end0 - cursor2.p0 + adjustment;
        const dC = cursor2.end1 - cursor2.p1;
        if (!cursor2.done || dA !== 0 || dC !== 0) {
            if (dA === dC && (!cursor2.linear || adjA || adjB)) {
                target.push(0, 0);
            }
            target.push(dA, dC);
        }
        cursor1.next(true);
        return cursor2.next(true);
    }
    if (cursor2.done) {
        const adjB = cursor2.end0 - cursor2.p0;
        const adjC = cursor2.end1 - cursor2.p1;
        const adjustment = adjB - adjC;
        const dA = cursor1.end0 - cursor1.p0;
        const dC = cursor1.end1 - cursor1.p1 + adjustment;
        if (dA === dC && (!cursor1.linear || adjustment !== 0)) {
            target.push(0, 0);
        }
        target.push(dA, dC);
        cursor2.next(true);
        return cursor1.next(true);
    }

    assert(cursor1.p1 === cursor2.p0, 'The shared edge must match between the two cursors.');
    if (cursor1.linear && cursor2.linear) {
        const p = Math.min(cursor1.end1, cursor2.end0);
        const dB = p - cursor1.p1;
        const pA = cursor1.begin0 + dB;
        const pC = cursor2.begin1 + dB;
        const dA = pA - cursor1.p0;
        const dC = pC - cursor2.p1;
        cursor1.p0 = pA;
        cursor1.p1 = p;
        cursor2.p0 = p;
        cursor2.p1 = pC;
        if (cursor1.p1 === cursor1.end1) {
            cursor1.next(true);
        }
        if (cursor2.p0 === cursor2.end0) {
            cursor2.next(true);
        }
        target.push(dA, dC);
        return true;
    }

    // Non-linear

    if (cursor1.end1 === cursor2.end0) {
        const dA = cursor1.end0 - cursor1.p0;
        const dC = cursor2.end1 - cursor2.p1;
        if (dA === dC) {
            // Force a non-linear map when the deltas are the same but one of the cursors is non-linear.
            // This is needed to ensure that the merged map accurately represents the transformations,
            // even when they result in no change in length.
            target.push(0, 0);
        }
        target.push(dA, dC);
        cursor1.next(true);
        cursor2.next(true);
        return true;
    }

    if (cursor1.linear) {
        if (cursor1.end1 < cursor2.end0) {
            // The linear segment in inside the non-linear segment.
            // Advance cursor 1 to the end of the linear segment.
            cursor1.next(false);
            return true;
        }
        // Split cursor 1 at the end of cursor 2 to maintain linearity.
        const p = cursor2.end0;
        const dB = p - cursor1.begin1;
        const pA = cursor1.begin0 + dB;
        const dA = pA - cursor1.p0;
        const dC = cursor2.end1 - cursor2.p1;
        if (dA === dC) {
            // Force a non-linear map when the deltas are the same but one of the cursors is non-linear.
            // This is needed to ensure that the merged map accurately represents the transformations,
            // even when they result in no change in length.
            target.push(0, 0);
        }
        target.push(dA, dC);
        cursor1.p0 = pA;
        cursor1.p1 = p;
        cursor2.next(true);
        return true;
    }

    if (cursor2.linear) {
        if (cursor2.end0 < cursor1.end1) {
            // The linear segment in inside the non-linear segment.
            // Advance cursor 2 to the end of the linear segment.
            cursor2.next(false);
            return true;
        }
        // Split cursor 2 at the end of cursor 1 to maintain linearity.
        const p = cursor1.end1;
        const dB = p - cursor2.begin0;
        const pC = cursor2.begin1 + dB;
        const dA = cursor1.end0 - cursor1.p0;
        const dC = pC - cursor2.p1;
        if (dA === dC) {
            // Force a non-linear map when the deltas are the same but one of the cursors is non-linear.
            // This is needed to ensure that the merged map accurately represents the transformations,
            // even when they result in no change in length.
            target.push(0, 0);
        }
        target.push(dA, dC);
        cursor1.next(true);
        cursor2.p0 = p;
        cursor2.p1 = pC;
        return true;
    }

    // Two non-linear segments. They cannot be split.
    if (cursor1.end1 < cursor2.end0) {
        cursor1.next(false);
        return true;
    }
    cursor2.next(false);
    return true;
}

export function sliceSourceMapToSourceRange(map: SourceMap | undefined, range: Range): SourceMap | undefined {
    if (!map?.length) return map;

    const [start, end] = range;

    let idx = 0;
    let p = 0;
    for (; idx < map.length && p + map[idx] < start; idx += 2) {
        p += map[idx];
    }

    if (idx >= map.length) {
        return [];
    }

    const startIdx = idx;
    const startOffset = start - p;

    for (; idx < map.length && p + map[idx] <= end; idx += 2) {
        p += map[idx];
    }

    const endIdx = idx;
    if (startIdx === endIdx) {
        return undefined;
    }

    const newMap = map.slice(startIdx, endIdx);

    if (startOffset !== 0) {
        newMap[0] -= startOffset;
        newMap[1] -= Math.min(startOffset, newMap[1]);
    }

    return newMap;
}

export function reverseSourceMap(map: SourceMap | undefined): SourceMap | undefined {
    if (!map?.length) return map;

    assert((map.length & 1) === 0, 'Map must be pairs of values.');

    const reversed: SourceMap = [];
    for (let i = 0; i < map.length; i += 2) {
        reversed.push(map[i + 1], map[i]);
    }
    return reversed;
}
