import type { MappedText, TextOffset } from '@cspell/cspell-types';
import type { ValidationIssue } from '../Models/ValidationIssue';
import { extractTextMapRangeOrigin } from '../util/TextMap';
import type * as TextRange from '../util/TextRange';

export type Offset = number;

export type SimpleRange = readonly [Offset, Offset];

export function mapIssueBackToOriginalPos(mappedText: MappedText, issue: ValidationIssue): ValidationIssue {
    if (!mappedText.map || mappedText.map.length === 0) return issue;
    const textOff = mapTextOffsetBackToOriginalPos(mappedText, issue);
    return {
        ...issue,
        ...textOff,
    };
}

function mapTextOffsetBackToOriginalPos(mappedText: MappedText, textOff: TextOffset): TextOffset {
    if (!mappedText.map || !mappedText.map.length) return textOff;
    const off = textOff.offset - mappedText.range[0];
    const range = mapRangeBackToOriginalPos([off, off + (textOff.length ?? textOff.text.length)], mappedText.map);
    return {
        text: textOff.text,
        offset: mappedText.range[0] + range[0],
        length: range[1] - range[0],
    };
}

export function mapRangeBackToOriginalPos(offRange: SimpleRange, map: number[] | undefined): SimpleRange {
    if (!map || !map.length) return offRange;

    const [start, end] = offRange;

    let i = 0,
        j = 0,
        p = 1;

    while (p < map.length && map[p] < start) {
        i = map[p - 1];
        j = map[p];
        p += 2;
    }

    const iA = start - j + i;

    while (p < map.length && map[p] < end) {
        i = map[p - 1];
        j = map[p];
        p += 2;
    }

    const iB = end - j + i;

    return [iA, iB];
}

export function mapRangeToLocal(rangeOrig: SimpleRange, map: number[] | undefined): SimpleRange {
    if (!map || !map.length) return rangeOrig;

    const [start, end] = rangeOrig;

    let i = 0,
        j = 0,
        p = 0;

    while (p < map.length && map[p] < start) {
        i = map[p];
        j = map[p + 1];
        p += 2;
    }

    const jA = start - i + j;

    while (p < map.length && map[p] < end) {
        i = map[p];
        j = map[p + 1];
        p += 2;
    }

    const jB = end - i + j;

    return [jA, jB];
}

/**
 * Factory to create a segmentation function that will segment MappedText against a set of includeRanges.
 * The function produced is optimized for forward scanning. It will perform poorly for randomly ordered offsets.
 * @param includeRanges Allowed ranges for words.
 */
export function createMappedTextSegmenter(
    includeRanges: TextRange.MatchRange[]
): (text: MappedText) => Iterable<MappedText> {
    let rangePos = 0;

    function* segmenter(pText: MappedText): Iterable<MappedText> {
        if (!includeRanges.length) {
            return;
        }

        const range = pText.range;
        const textEndPos = range[1];
        let textStartPos = range[0];
        while (rangePos && (rangePos >= includeRanges.length || includeRanges[rangePos].startPos > textStartPos)) {
            rangePos -= 1;
        }

        const cur = includeRanges[rangePos];
        if (textEndPos <= cur.endPos && textStartPos >= cur.startPos) {
            yield pText;
            return;
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
                yield extractTextMapRangeOrigin(pText, [a, b]);
            }
            textStartPos = b;
        }
    }

    return segmenter;
}
