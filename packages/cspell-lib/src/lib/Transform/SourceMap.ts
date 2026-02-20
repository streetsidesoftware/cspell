import assert from 'node:assert';

import type { Range, SourceMap } from '@cspell/cspell-types';

export interface SourceMapCursor {
    /**
     * The source map being traversed.
     */
    sourceMap: SourceMap;
    /**
     * The current index in the source map.
     */
    idx: number;
    /**
     * The base offset in the source text.
     */
    base0: number;
    /**
     * The base offset in the transformed text.
     */
    base1: number;
}

class SourceMapCursorImpl implements SourceMapCursor {
    sourceMap: SourceMap;
    idx: number;
    base0: number;
    base1: number;

    constructor(sourceMap: SourceMap) {
        this.sourceMap = sourceMap;
        this.idx = 0;
        this.base0 = 0;
        this.base1 = 0;
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

export function resetCursor(cursor: SourceMapCursor): void {
    cursor.idx = 0;
    cursor.base0 = 0;
    cursor.base1 = 0;
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

    if (offsetInSrc < cursor.base0) {
        // If the offset is before the current base, reset the cursor to the start of the map.
        resetCursor(cursor);
    }

    const srcMap = cursor.sourceMap;

    let idx = cursor.idx;
    let base0 = cursor.base0;
    let base1 = cursor.base1;
    for (; idx < srcMap.length && offsetInSrc > srcMap[idx] + base0; idx += 2) {
        base0 += srcMap[idx];
        base1 += srcMap[idx + 1];
    }

    cursor.idx = idx;
    cursor.base0 = base0;
    cursor.base1 = base1;

    if (offsetInSrc === srcMap[idx] + base1) {
        base0 += srcMap[idx];
        base1 += srcMap[idx + 1];
        idx += 2;
    }
    const d0 = srcMap[idx];
    const d1 = srcMap[idx + 1];
    return d0 === d1 ? offsetInSrc - base0 + base1 : base1;
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

    if (offsetInDst < cursor.base1) {
        // If the offset is before the current base, reset the cursor to the start of the map.
        resetCursor(cursor);
    }

    const srcMap = cursor.sourceMap;

    let idx = cursor.idx;
    let base0 = cursor.base0;
    let base1 = cursor.base1;
    for (; idx < srcMap.length && offsetInDst > srcMap[idx + 1] + base1; idx += 2) {
        base0 += srcMap[idx];
        base1 += srcMap[idx + 1];
    }

    cursor.idx = idx;
    cursor.base0 = base0;
    cursor.base1 = base1;

    if (offsetInDst === srcMap[idx + 1] + base1) {
        base0 += srcMap[idx];
        base1 += srcMap[idx + 1];
        idx += 2;
    }

    const d0 = srcMap[idx];
    const d1 = srcMap[idx + 1];
    return d0 === d1 ? offsetInDst - base1 + base0 : base0;
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

    while (!cursor1.done && !cursor2.done) {
        advanceCursors(cursor1, cursor2, result);
    }

    while (!cursor1.done) {
        advanceCursor(cursor1, result);
    }

    while (!cursor2.done) {
        advanceCursor(cursor2, result);
    }
    return result;
}

class SourceMapMergeCursor {
    sourceMap: SourceMap;
    idx: number;
    base0: number;
    base1: number;
    end0: number;
    end1: number;
    p0: number;
    p1: number;
    d0: number;
    d1: number;
    linear: boolean;
    done: boolean;

    constructor(sourceMap: SourceMap, idx: number = 0) {
        this.sourceMap = sourceMap;
        this.idx = idx;
        this.base0 = 0;
        this.base1 = 0;
        this.p0 = 0;
        this.p1 = 0;
        this.d0 = this.sourceMap[this.idx] || 0;
        this.d1 = this.sourceMap[this.idx + 1] || 0;
        this.end0 = this.base0 + this.d0;
        this.end1 = this.base1 + this.d1;
        this.linear = this.d0 === this.d1;
        this.done = this.idx >= this.sourceMap.length;
    }

    next(): void {
        if (this.idx >= this.sourceMap.length) return;
        this.idx += 2;
        this.base0 += this.d0;
        this.base1 += this.d1;
        this.p0 = this.base0;
        this.p1 = this.base1;
        this.d0 = this.sourceMap[this.idx] || 0;
        this.d1 = this.sourceMap[this.idx + 1] || 0;
        this.end0 = this.base0 + this.d0;
        this.end1 = this.base1 + this.d1;
        this.linear = this.d0 === this.d1;
        this.done = this.idx >= this.sourceMap.length;
    }
}

/**
 * Advance the cursor to the next position in the source map and push the corresponding delta pair to the target map.
 * @param cursor - The cursor to advance. The cursor will be updated to the next position in the source map.
 * @param target - The target map to push the delta pair to. The delta pair represents the change in offsets from
 *   the current position to the next position in the source map.
 */
function advanceCursor(cursor: SourceMapMergeCursor, target: SourceMap): void {
    const dA = cursor.end0 - cursor.p0;
    const dC = cursor.end1 - cursor.p1;
    target.push(dA, dC);
    cursor.next();
}

/**
 * Advance one or both cursors to the next position in their respective source maps and push the corresponding delta pair(s) to the target map.
 * The function compares the end positions of the two cursors and advances the cursor(s) that have the smaller end position.
 * If both cursors have the same end position, both are advanced.
 * The delta pair(s) pushed to the target map represent the change in offsets from the current position to the next position in the source map(s).
 * @param cursor1 - The cursor for the first transformation map from source to intermediate.
 * @param cursor2 - The cursor for the second transformation map from intermediate to destination.
 * @param target - The target source map from source to destination to push the delta pair(s) to.
 */
function advanceCursors(cursor1: SourceMapMergeCursor, cursor2: SourceMapMergeCursor, target: SourceMap): void {
    if (cursor1.end1 === cursor2.end0) {
        const dA = cursor1.end0 - cursor1.p0;
        const dC = cursor2.end1 - cursor2.p1;
        // If both cursors are not linear, so we need to emit two deltas pairs.
        if (cursor1.linear || cursor2.linear) {
            target.push(dA, dC);
        } else {
            target.push(dA, 0, 0, dC);
        }
        cursor1.next();
        cursor2.next();
        return;
    }
    if (cursor1.end1 < cursor2.end0) {
        const dA = cursor1.end0 - cursor1.p0;
        const dB = cursor1.end1 - cursor1.p1;
        cursor1.next();
        const dC = cursor2.linear ? dB : 0;
        cursor2.p0 += dB;
        cursor2.p1 += dC;
        target.push(dA, dC);
        return;
    }
    const dB = cursor2.end0 - cursor2.p0;
    const dC = cursor2.end1 - cursor2.p1;
    cursor2.next();
    const dA = cursor1.linear ? dB : 0;
    cursor1.p0 += dA;
    cursor1.p1 += dB;
    target.push(dA, dC);
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
