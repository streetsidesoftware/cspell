import assert from 'node:assert';
import { stripVTControlCharacters } from 'node:util';

export function pad(s: string, w: number): string {
    const p = padWidth(s, w);
    if (!p) return s;
    return s.padEnd(p + s.length);
}

export function padWidth(s: string, target: number): number {
    const sWidth = ansiWidth(s);
    return Math.max(target - sWidth, 0);
}

export function padLeft(s: string, w: number): string {
    const p = padWidth(s, w);
    if (!p) return s;
    return s.padStart(p + s.length);
}

export function isAnsiString(s: string): boolean {
    // Check if the string contains ANSI control characters.
    return s.includes('\u001B') || s.includes('\u009B');
}

export function width(s: string): number {
    // Remove control codes and high surrogates to get the approximate width.
    assert(!s.includes('\u001B'), 'String contains ANSI control characters');
    return (
        s
            // eslint-disable-next-line no-control-regex, no-misleading-character-class
            .replaceAll(/[\u0000-\u001F\u0300-\u036F]/g, '')
            .replaceAll(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '.')
            .replaceAll('…', '.')
            .replaceAll(/\p{M}/gu, '').length
    );
}

export function ansiWidth(s: string): number {
    return width(stripVTControlCharacters(s));
}

/**
 * Prune the end of a string to fit within a specified width, adding an ellipsis if necessary.
 * @param str - the text to prune - ANSI is not supported
 * @param maxWidth - the maximum width of the text
 * @param pad - the string to use for padding, default is '…'
 * @returns the pruned text
 */
export function pruneTextEnd(str: string, maxWidth: number | undefined, pad: string = '…'): string {
    if (!maxWidth || maxWidth <= 0) return str;
    if (str.length <= maxWidth) return str;
    if (isAnsiString(str)) return pruneAnsiTextEnd(str, maxWidth, pad);
    const padWidth = width(pad);
    const maxWidthWithPad = maxWidth - padWidth;
    const letters = [...str];
    let len = 0;
    for (let i = 0; i < letters.length; i++) {
        const c = letters[i];
        len += width(c);
        if (len > maxWidthWithPad) {
            let j = i + 1;
            while (j < letters.length && width(letters[j]) === 0) {
                ++j;
            }
            return j === letters.length ? str : letters.slice(0, i).join('') + pad;
        }
    }
    return str;
}

/**
 * Prune the start of a string to fit within a specified width, adding an ellipsis if necessary.
 * @param str - the text to prune - ANSI is not supported
 * @param maxWidth - the maximum width of the text
 * @param pad - the string to use for padding, default is '…'
 * @returns the pruned text
 */
export function pruneTextStart(str: string, maxWidth: number | undefined, pad: string = '…'): string {
    if (!maxWidth || maxWidth <= 0) return str;
    if (str.length <= maxWidth) return str;
    const padWidth = width(pad);
    const maxWidthWithPad = maxWidth - padWidth;
    const letters = [...str];
    let len = 0;
    for (let i = letters.length - 1; i >= 1; i--) {
        const c = letters[i];
        len += width(c);
        if (len > maxWidthWithPad) {
            i += 1;
            while (i < letters.length && width(letters[i]) === 0) {
                ++i;
            }
            return pad + letters.slice(i).join('');
        }
    }
    return str;
}

// https://github.com/nodejs/node/blob/0ab50c2768453e932b5402eaea3df813e725e330/lib/internal/util/inspect.js#L283
const ansi = new RegExp(
    '[\\u001B\\u009B][[\\]()#;?]*' +
        '(?:(?:(?:(?:;[-a-zA-Z\\d\\/\\#&.:=?%@~_]+)*' +
        '|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/\\#&.:=?%@~_]*)*)?' +
        '(?:\\u0007|\\u001B\\u005C|\\u009C))' +
        '|(?:(?:\\d{1,4}(?:;\\d{0,4})*)?' +
        '[\\dA-PR-TZcf-nq-uy=><~]))',
    'g',
);

interface AnsiStrFragment {
    type: 'text' | 'ansi';
    text: string;
}

export function parseAnsiStr(str: string): AnsiStrFragment[] {
    const fragments: AnsiStrFragment[] = [];
    let lastIndex = 0;

    for (const match of str.matchAll(ansi)) {
        if (match.index > lastIndex) {
            fragments.push({ type: 'text', text: str.slice(lastIndex, match.index) });
        }
        fragments.push({ type: 'ansi', text: match[0] });
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < str.length) {
        fragments.push({ type: 'text', text: str.slice(lastIndex) });
    }

    return fragments;
}

/**
 * Prune the end of a string to fit within a specified width, adding an ellipsis if necessary.
 * @param str - the text to prune - ANSI is supported
 * @param maxWidth - the maximum width of the text
 * @param pad - the string to use for padding, default is '…'
 * @returns the pruned text
 */
export function pruneAnsiTextEnd(str: string, maxWidth: number | undefined, pad: string = '…'): string {
    if (!maxWidth || maxWidth <= 0) return str;
    if (str.length <= maxWidth) return str;
    if (ansiWidth(str) <= maxWidth) return str;
    const padWidth = ansiWidth(pad);
    const fragments = parseAnsiStr(str);
    const maxWidthWithPad = maxWidth - padWidth;
    let remaining = maxWidthWithPad;

    for (const frag of fragments) {
        if (frag.type !== 'text') continue;
        if (remaining <= 0) {
            frag.text = '';
            continue;
        }
        const pruned = pruneTextEnd(frag.text, remaining, pad);
        if (pruned !== frag.text) {
            frag.text = pruned;
            remaining = 0; // Stop processing further fragments
            continue;
        }
        remaining -= width(frag.text);
    }
    return fragments.map((frag) => frag.text).join('');
}

/**
 * Prune the start of a string to fit within a specified width, adding an ellipsis if necessary.
 * @param str - the text to prune - ANSI is supported
 * @param maxWidth - the maximum width of the text
 * @param pad - the string to use for padding, default is '…'
 * @returns the pruned text
 */
export function pruneAnsiTextStart(str: string, maxWidth: number | undefined, pad: string = '…'): string {
    if (!maxWidth || maxWidth <= 0) return str;
    if (str.length <= maxWidth) return str;
    if (ansiWidth(str) <= maxWidth) return str;
    const padWidth = ansiWidth(pad);
    const fragments = parseAnsiStr(str);
    const maxWidthWithPad = maxWidth - padWidth;
    let remaining = maxWidthWithPad;

    for (const frag of fragments.reverse()) {
        if (frag.type !== 'text') continue;
        if (remaining <= 0) {
            frag.text = '';
            continue;
        }
        const pruned = pruneTextStart(frag.text, remaining, pad);
        if (pruned !== frag.text) {
            frag.text = pruned;
            remaining = 0; // Stop processing further fragments
            continue;
        }
        remaining -= width(frag.text);
    }
    return fragments
        .reverse()
        .map((frag) => frag.text)
        .join('');
}
