/**
 * Expand a line into a set of characters.
 *
 * Example:
 * - `a-c` -> `<a,b,c>`
 * - `ac-` -> `<a,c,->`
 * - `-abz` -> `<-,a,b,z>`
 * - `\u0300-\u0308` -> `<accents>`
 *
 * @param line - set of characters
 * @param rangeChar - the character to indicate ranges, set to empty to not have ranges.
 */
export function expandCharacterSet(line: string, rangeChar = '-'): Set<string> {
    const charSet = new Set<string>();

    let mode: 0 | 1 = 0;
    let prev = '';

    for (const char of line) {
        if (mode) {
            expandRange(prev, char).forEach((a) => charSet.add(a));
            mode = 0;
        }
        if (char === rangeChar) {
            // store the `-` if there isn't a previous value.
            if (prev) {
                mode = 1;
                continue;
            }
        }
        charSet.add(char);
        prev = char;
    }

    // catch the trailing `-`
    if (mode) charSet.add(rangeChar);

    return charSet;
}

/**
 * Expands a range between two characters.
 * - `a <= b` -- `[a, b]`
 * - `a > b` -- `[]`
 * @param a - staring character
 * @param b - ending character
 * @returns array of unicode characters.
 */
export function expandRange(a: string, b: string): string[] {
    const values: string[] = [];

    const end = b.codePointAt(0);
    const begin = a.codePointAt(0);

    if (!(begin && end)) return values;

    for (let i = begin; i <= end; ++i) {
        values.push(String.fromCodePoint(i));
    }

    return values;
}
