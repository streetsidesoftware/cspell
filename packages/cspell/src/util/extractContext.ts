/* eslint-disable unicorn/prefer-code-point */
import type { TextDocumentOffset, TextOffset } from '@cspell/cspell-types';

export function fixOffsetToBeginningOfChar(text: string, offset: number): number {
    const code = text.charCodeAt(offset) || 0;
    return offset + ((code & 0xfc00) === 0xdc00 ? 1 : 0);
}

function prefCharIndex(text: string, offset: number, count = 1): number {
    if (offset - count < 0) return 0;
    for (; count > 0 && offset > 0; count--) {
        let code = text.charCodeAt(--offset) || 0;
        if (code === 0xfe0f) {
            // Remove zero-width joiner
            code = text.charCodeAt(--offset) || 0;
        }
        offset -= (code & 0xfc00) === 0xdc00 ? 1 : 0;
    }
    return offset < 0 ? 0 : offset;
}

function nextCharIndex(text: string, offset: number, count = 1): number {
    if (offset + count >= text.length) return text.length;
    for (; count > 0 && offset < text.length; count--) {
        const code = text.charCodeAt(offset++) || 0;
        offset += (code & 0xfc00) === 0xd800 ? 1 : 0;
        if (text.charCodeAt(offset) === 0xfe0f) {
            // Skip zero-width joiner
            offset++;
        }
    }
    return offset > text.length ? text.length : offset;
}

export function lineContext(lineText: string, start: number, end: number, contextRange: number): TextOffset {
    let left = prefCharIndex(lineText, start, contextRange);
    let right = nextCharIndex(lineText, end, contextRange);

    const isLetter = /^\p{L}$/u;
    const isMark = /^\p{M}$/u;

    for (let n = contextRange / 2; n > 0 && left > 0; n--, left--) {
        const c = lineText[left - 1];
        if (isMark.test(c)) {
            if (!isLetter.test(lineText[left - 2])) {
                break;
            }
            left--;
            continue;
        }
        if (!isLetter.test(lineText[left - 1])) {
            break;
        }
    }

    for (let n = contextRange / 2; n > 0 && right < lineText.length; n--, right++) {
        if (!isLetter.test(lineText[right])) {
            break;
        }
        if (isMark.test(lineText[right + 1])) {
            right++;
        }
    }

    left = left < 0 ? 0 : left;

    const t0 = lineText.slice(left, right);
    const tLeft = t0.trimStart();
    left = Math.min(left + t0.length - tLeft.length, start);
    const text = tLeft.trimEnd();

    const context = {
        text,
        offset: left,
    };
    return context;
}

export function extractContext(
    tdo: Pick<TextDocumentOffset, 'line' | 'offset' | 'text'>,
    contextRange: number,
): TextOffset {
    const { line, offset, text } = tdo;

    const start = offset - line.offset;
    const context = lineContext(line.text, start, start + text.length, contextRange);
    context.offset += line.offset;
    return context;
}
