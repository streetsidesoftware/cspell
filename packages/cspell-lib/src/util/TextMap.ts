import { TextMap } from '@cspell/cspell-types';
import { Range } from '@cspell/cspell-types/Parser';
import assert from 'assert';

/**
 * Extract a substring from a TextMap.
 * @param textMap - A text range with an optional map
 * @param extractRange - The range in the original document to extract
 * @returns The TextMap covering extractRange
 */
export function extractTextMapRangeOrigin(textMap: TextMap, extractRange: Range): TextMap {
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
    const sMap = head.concat(srcMap).concat(tail);

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

    return { text, range, map };
}
