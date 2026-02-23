import type { MappedText, SourceMap, TextOffset } from '@cspell/cspell-types';

import type { ValidationIssue } from '../Models/ValidationIssue.js';
import { calculateRangeInDest, calculateRangeInSrc, extractTextMapRangeOrigin } from './TextMap.js';
import type * as TextRange from './TextRange.js';
import type { SimpleRange } from './types.js';

export function mapIssueBackToOriginalPos(mappedText: MappedText, issue: ValidationIssue): ValidationIssue {
    if (!mappedText.map?.length) return issue;
    const textOff = mapTextOffsetBackToOriginalPos(mappedText, issue);
    return {
        ...issue,
        ...textOff,
    };
}

function mapTextOffsetBackToOriginalPos(mappedText: MappedText, textOff: TextOffset): TextOffset {
    if (!mappedText.map?.length) return textOff;
    const off = textOff.offset - mappedText.range[0];
    const range = mapRangeBackToOriginalPos([off, off + (textOff.length ?? textOff.text.length)], mappedText.map);
    return {
        text: textOff.text,
        offset: mappedText.range[0] + range[0],
        length: range[1] - range[0],
    };
}

export function mapRangeBackToOriginalPos(offRange: SimpleRange, map: SourceMap | undefined): SimpleRange {
    if (!map || !map.length) return offRange;

    return calculateRangeInSrc(map, offRange);
}

export function mapRangeToLocal(rangeOrig: SimpleRange, map: SourceMap | undefined): SimpleRange {
    if (!map?.length) return rangeOrig;

    return calculateRangeInDest(map, rangeOrig);
}

/**
 * Factory to create a segmentation function that will segment MappedText against a set of includeRanges.
 * The function produced is optimized for forward scanning. It will perform poorly for randomly ordered offsets.
 * @param includeRanges Allowed ranges for words.
 */
export function createMappedTextSegmenter(
    includeRanges: TextRange.MatchRange[],
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
