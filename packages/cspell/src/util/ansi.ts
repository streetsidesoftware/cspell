import { stripVTControlCharacters } from 'node:util';

import ansiRegex from 'ansi-regex';

export function isAnsiString(s: string): boolean {
    // Check if the string contains ANSI control characters.
    return s.includes('\u001B') || s.includes('\u009B');
}

/**
 *
 * @param s - the string to measure - should NOT contains ANSI codes
 * @param tabWidth -
 * @returns
 */
export function width(s: string, tabWidth: number = 1): number {
    // Remove control codes and high surrogates to get the approximate width.
    return (
        s
            .replaceAll('…', '.')
            .replaceAll('\t', ' '.repeat(tabWidth))
            .replaceAll(/\p{M}/gu, '')
            .replaceAll(/\p{L}/gu, '.')
            // eslint-disable-next-line no-control-regex, no-misleading-character-class
            .replaceAll(/[\u0000-\u001F\u0300-\u036F]/g, '')
            .replaceAll(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, '.').length
    );
}

/**
 * Measure the width of a string containing ANSI control characters.
 * @param s - string to measure with width in characters.
 * @returns the approximate number of screen characters.
 */
export function ansiWidth(s: string): number {
    return width(stripVTControlCharacters(s));
}

export interface StrFragment<T> {
    type: 'text' | T;
    text: string;
}

export function fragmentString<T>(str: string, splitOnRegex: RegExp, sType: T): StrFragment<T>[] {
    const fragments: StrFragment<T>[] = [];
    let lastIndex = 0;

    for (const match of str.matchAll(new RegExp(splitOnRegex))) {
        if (match.index > lastIndex) {
            fragments.push({ type: 'text', text: str.slice(lastIndex, match.index) });
        }
        fragments.push({ type: sType, text: match[0] });
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < str.length) {
        fragments.push({ type: 'text', text: str.slice(lastIndex) });
    }

    return fragments;
}

const ansi = ansiRegex();

export interface AnsiStrFragment {
    type: 'text' | 'ansi';
    text: string;
}

export function parseAnsiStr(str: string): AnsiStrFragment[] {
    return fragmentString(str, ansi, 'ansi');
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
