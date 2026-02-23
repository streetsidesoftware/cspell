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

    if (!textMap.map?.length) {
        const text = srcTxt.slice(a, b);
        return { text, range };
    }

    const rangeSrc = [a, b] as const;
    const [a1, b1] = calculateRangeInDest(textMap.map, rangeSrc);

    const tm: Writable<MappedText> = {
        text: srcTxt.slice(a1, b1),
        range,
    };

    const sourceMap = sliceSourceMapToSourceRange(textMap.map, rangeSrc);

    if (sourceMap?.length) {
        tm.map = sourceMap;
    }

    return tm;
}

export function calculateRangeInDest(srcMap: SourceMap | undefined, rangeOrigin: Range): Range {
    const cursor = createSourceMapCursor(srcMap);
    if (!cursor) {
        return rangeOrigin;
    }

    const start = cursor.mapOffsetToDest(rangeOrigin[0]);
    const end = cursor.mapOffsetToDest(rangeOrigin[1]);
    return [start, end];
}

export function calculateRangeInSrc(srcMap: SourceMap | undefined, rangeOrigin: Range): Range {
    const cursor = createSourceMapCursor(srcMap);
    if (!cursor) {
        return rangeOrigin;
    }

    const start = cursor.mapOffsetToSrc(rangeOrigin[0]);
    const end = cursor.mapOffsetToSrc(rangeOrigin[1]);
    return [start, end];
}

export function calculateTextMapRangeDest(textMap: MappedText, rangeOrigin: Range): Range {
    const { range: srcRange, map: srcMap } = textMap;
    const [r0, r1] = srcRange;

    const start = Math.min(Math.max(rangeOrigin[0], r0), r1) - r0;
    const end = Math.min(Math.max(rangeOrigin[1], r0), r1) - r0;

    const range = [start, end] as const;
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

interface WithRange {
    readonly range: Range;
}

export function doesIntersect(textMap: WithRange, rangeOrigin: Range): boolean {
    const r = textMap.range;
    return r[0] < rangeOrigin[1] && r[1] > rangeOrigin[0];
}

type Writable<T> = { -readonly [P in keyof T]: T[P] };
