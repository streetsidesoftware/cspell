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

export function width(s: string): number {
    // Remove control codes and high surrogates to get the approximate width.
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
