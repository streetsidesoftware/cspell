import assert from 'node:assert';

import type { MappedText, Range, SourceMap } from '@cspell/cspell-types';

import { calcOffsetInDst, calcOffsetInSrc, createSourceMapCursor, sliceSourceMapToSourceRange } from './SourceMap.js';

/**
 * Extract a substring from a TextMap.
 * @param textMap - A text range with an optional map
 * @param extractRange - The range in the original document to extract
 * @returns The TextMap covering extractRange
 */
export function extractTextMapRangeOrigin(textMap: MappedText, extractRange: Range): MappedText {
    const { text: srcTxt, range: srcRange } = textMap;
    const [r0, r1] = srcRange;
    const startOrig = Math.min(Math.max(extractRange[0], r0), r1);
    const endOrig = Math.min(Math.max(extractRange[1], r0), r1);
    const a = startOrig - r0;
    const b = endOrig - r0;
    const range = [startOrig, endOrig] as const;
    const text = srcTxt.slice(a, b);
    const tm: Writable<MappedText> = { text, range };

    const mapRel = sliceSourceMapToSourceRange(textMap.map, [a, b]);

    if (mapRel?.length) {
        tm.map = mapRel;
    }

    return tm;
}

export function calculateRangeInDest(srcMap: SourceMap | undefined, rangeOrigin: Range): Range {
    const cursor = createSourceMapCursor(srcMap);
    if (!cursor) {
        return rangeOrigin;
    }

    const start = calcOffsetInDst(cursor, rangeOrigin[0]);
    const end = calcOffsetInDst(cursor, rangeOrigin[1]);
    return [start, end];
}

export function calculateRangeInSrc(srcMap: SourceMap | undefined, rangeOrigin: Range): Range {
    const cursor = createSourceMapCursor(srcMap);
    if (!cursor) {
        return rangeOrigin;
    }

    const start = calcOffsetInSrc(cursor, rangeOrigin[0]);
    const end = calcOffsetInSrc(cursor, rangeOrigin[1]);
    return [start, end];
}

export function calculateTextMapRangeDest(textMap: MappedText, rangeOrigin: Range): Range {
    const { range: srcRange, map: srcMap } = textMap;
    const [r0, r1] = srcRange;

    const start = Math.min(Math.max(rangeOrigin[0], r0), r1) - r0;
    const end = Math.min(Math.max(rangeOrigin[1], r0), r1) - r0;

    const range = [start, end] as const;
    if (!srcMap || !srcMap.length) {
        return range;
    }
    return calculateRangeInDest(srcMap, range);
}

/**
 * Map an offset in the transformed text back to the original text.
 * It will find the first matching position in the map.
 *
 * @param map - The source map to use for the mapping.
 *   If undefined or empty, the input offset is returned, assuming it is a 1:1 mapping.
 * @param offset - the offset in the transformed text to map back to the original text
 */
export function mapOffsetToSource(map: SourceMap | undefined, offset: number): number {
    const cursor = createSourceMapCursor(map);
    return calcOffsetInSrc(cursor, offset);
}

/**
 * Map an offset in the original text to the transformed text.
 * It will find the first matching position in the map.
 *
 * @param map - The source map to use for the mapping.
 *   If undefined or empty, the input offset is returned, assuming it is a 1:1 mapping.
 * @param offset - the offset in the original text to map to the transformed text
 */
export function mapOffsetToDest(map: SourceMap | undefined, offset: number): number {
    const cursor = createSourceMapCursor(map);
    return calcOffsetInDst(cursor, offset);
}

/**
 * Map an offset in the transformed text back to the original text.
 *
 * @param map - The source map to use for the mapping.
 *   If undefined or empty, the input offset is returned, assuming it is a 1:1 mapping.
 * @param range - the range in the transformed text to map back to the original text
 */
export function calRangeInSrc(map: SourceMap | undefined, range: Range): Range {
    if (!map || !map.length) {
        return range;
    }
    assert(range[0] <= range[1], 'Range start must be less than or equal to range end.');

    const cursor = createSourceMapCursor(map);
    const start = calcOffsetInSrc(cursor, range[0]);
    const end = calcOffsetInSrc(cursor, range[1]);
    return [start, end];
}

interface WithRange {
    readonly range: Range;
}

export function doesIntersect(textMap: WithRange, rangeOrigin: Range): boolean {
    const r = textMap.range;
    return r[0] < rangeOrigin[1] && r[1] > rangeOrigin[0];
}

type Writable<T> = { -readonly [P in keyof T]: T[P] };
