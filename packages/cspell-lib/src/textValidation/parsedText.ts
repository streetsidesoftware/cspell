import { TextOffset, ParsedText } from '@cspell/cspell-types';
import { ValidationIssue } from './validator';

export type Offset = number;

export type SimpleRange = readonly [Offset, Offset];

export function mapIssueBackToOriginalPos(parsedText: ParsedText, issue: ValidationIssue): ValidationIssue {
    if (!parsedText.map || parsedText.map.length === 0) return issue;
    const textOff = mapTextOffsetBackToOriginalPos(parsedText, issue);
    return {
        ...issue,
        ...textOff,
    };
}

function mapTextOffsetBackToOriginalPos(parsedText: ParsedText, textOff: TextOffset): TextOffset {
    if (!parsedText.map || !parsedText.map.length) return textOff;
    const off = textOff.offset - parsedText.range[0];
    const range = mapRangeBackToOriginalPos([off, off + (textOff.length ?? textOff.text.length)], parsedText.map);
    return {
        text: textOff.text,
        offset: parsedText.range[0] + range[0],
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
