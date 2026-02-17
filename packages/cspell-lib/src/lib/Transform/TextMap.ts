import assert from 'node:assert';

import type { MappedText, Range, SourceMap } from '@cspell/cspell-types';

/**
 * Extract a substring from a TextMap.
 * @param textMap - A text range with an optional map
 * @param extractRange - The range in the original document to extract
 * @returns The TextMap covering extractRange
 */
export function extractTextMapRangeOrigin(textMap: MappedText, extractRange: Range): MappedText {
    const { text: srcTxt, range: srcRange, map: srcMap } = textMap;
    const [r0, r1] = srcRange;
    const startOrig = Math.min(Math.max(extractRange[0], r0), r1);
    const endOrig = Math.min(Math.max(extractRange[1], r0), r1);
    const a = startOrig - r0;
    const b = endOrig - r0;
    const range = [startOrig, endOrig] as const;
    if (!srcMap || !srcMap.length || a === b) {
        const text = srcTxt.slice(a, b);
        return { text, range };
    }

    assert((srcMap.length & 1) === 0, 'Map must be pairs of values.');

    const mapLen = srcMap.length;
    const mapEndSrc = srcMap[mapLen - 2];
    const mapEndDst = srcMap[mapLen - 1];
    const endDiff = srcTxt.length - mapEndDst;
    const head = !srcMap[0] && !srcMap[1] ? [] : [0, 0];
    const tail = [mapEndSrc + endDiff, mapEndDst + endDiff];
    const sMap = [...head, ...srcMap, ...tail];

    let idx = 0;
    for (; idx < sMap.length && a >= sMap[idx]; idx += 2) {
        // empty
    }
    const aIdx = idx;
    idx -= 2;
    const a0 = a - sMap[idx];
    const a1 = a0 + sMap[idx + 1];
    for (; idx < sMap.length && b > sMap[idx]; idx += 2) {
        // empty
    }
    const bIdx = idx;
    const b0 = b - sMap[idx];
    const b1 = b0 + sMap[idx + 1];
    const text = srcTxt.slice(a1, b1);
    if (bIdx === aIdx) {
        return { text, range };
    }
    const ab = [a0, a1];
    const map = sMap.slice(aIdx, bIdx + 2).map((v, i) => v - ab[i & 1]);

    const result: Writable<MappedText> = { text, range };

    if (map.length) {
        result.map = map;
    }

    return result;
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
    if (!map || !map.length) {
        return offset;
    }
    assert((map.length & 1) === 0, 'Map must be pairs of values.');
    let idx = 0;
    let base0 = 0;
    let base1 = 0;
    for (; idx < map.length && offset > map[idx + 1]; idx += 2) {
        base0 = map[idx];
        base1 = map[idx + 1];
    }
    if (idx >= map.length) {
        return offset - base1 + base0;
    }
    if (offset === map[idx + 1]) {
        return map[idx];
    }
    return Math.min(offset - base1 + base0, map[idx]);
}

/**
 * Map an offset in the transformed text back to the original text.
 *
 * @param map - The source map to use for the mapping.
 *   If undefined or empty, the input offset is returned, assuming it is a 1:1 mapping.
 * @param range - the range in the transformed text to map back to the original text
 */
export function mapRangeToSource(map: SourceMap | undefined, range: Range): Range {
    if (!map || !map.length) {
        return range;
    }
    assert((map.length & 1) === 0, 'Map must be pairs of values.');
    assert(range[0] <= range[1], 'Range start must be less than or equal to range end.');

    const start = range[0];
    const end = range[1];
    let idx = 0;
    let base0 = 0;
    let base1 = 0;
    for (; idx < map.length && start > map[idx + 1]; idx += 2) {
        base0 = map[idx];
        base1 = map[idx + 1];
    }
    let max = idx < map.length ? map[idx] : start;
    const mappedStart = Math.min(start - base1 + base0, max);
    for (; idx < map.length && end > map[idx + 1]; idx += 2) {
        base0 = map[idx];
        base1 = map[idx + 1];
    }
    max = idx < map.length ? map[idx] : end;
    const mappedEnd = Math.min(end - base1 + base0, max);
    return [mappedStart, mappedEnd];
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

    let idx1 = 0;
    let a = 0;
    let b = 0;
    let c = 0;

    // The algorithm iterates through the second map,
    // using the values to determine how to adjust the first map.
    for (let idx2 = 0; idx2 < second.length; idx2 += 2) {
        const b1 = second[idx2];
        const c1 = second[idx2 + 1];

        for (; idx1 < first.length && first[idx1 + 1] < b1; idx1 += 2) {
            a = first[idx1];
            b = first[idx1 + 1];
            c += a - b;
            result.push(a, c);
        }

        c = c1;
        for (; idx1 < first.length && first[idx1 + 1] === b1; idx1 += 2) {
            a = first[idx1];
            b = first[idx1 + 1];
            result.push(a, c);
        }

        if (b1 - b) {
            a += b1 - b;
            result.push(a, c);
        }

        b = b1;
    }

    const diffCB = c - b;

    for (; idx1 < first.length; idx1 += 2) {
        const a = first[idx1];
        const b = first[idx1 + 1];
        result.push(a, b + diffCB);
    }

    return result;
}

interface WithRange {
    readonly range: Range;
}

export function doesIntersect(textMap: WithRange, rangeOrigin: Range): boolean {
    const r = textMap.range;
    return r[0] < rangeOrigin[1] && r[1] > rangeOrigin[0];
}

type Writable<T> = { -readonly [P in keyof T]: T[P] };
