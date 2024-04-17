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

/**
 * Tries to find the different cases for a letter.
 * It can generate multiple forms:
 * - `ß` => `['ß', 'SS', 'ss']`
 * - `a` => `['a', 'A']`
 * - `A` => `['A', 'z']`
 * - `Å` => `['A', 'z']`
 * @param letter - the letter to generate upper and lower cases.
 * @param locale - the locale to use for changing case.
 * @returns the set of found cases.
 */
export function caseForms(letter: string, locale: string | string[] | undefined): string[] {
    const forms = new Set([letter]);

    function tryCases(s: string) {
        forms.add(s.toLocaleLowerCase(locale));
        forms.add(s.toLocaleUpperCase(locale));
    }

    tryCases(letter);
    [...forms].forEach(tryCases);
    return [...forms].filter((a) => !!a);
}

/**
 * Generate the different normalized forms of the letters.
 * @param letter - letter to normalize.
 * @returns combined set of possible forms.
 */
export function accentForms(letter: string): Iterable<string> {
    const forms = new Set([letter, letter.normalize('NFC'), letter.normalize('NFD')]);
    return forms;
}

/**
 * Remove all accents.
 * @param characters - unicode characters
 * @returns characters with accents removed (if it was possible)
 */
export function stripAccents(characters: string): string {
    return characters.normalize('NFD').replaceAll(/\p{M}/gu, '');
}

/**
 * Remove all non accent characters from a string.
 * @param characters - characters with accents.
 * @returns - only the accents.
 */
export function stripNonAccents(characters: string): string {
    return characters.normalize('NFD').replaceAll(/[^\p{M}]/gu, '');
}

export function isValidUtf16Character(char: string): boolean {
    const len = char.length;
    const code = char.charCodeAt(0) & 0xfc00;
    const valid =
        (len === 1 && (code & 0xf800) !== 0xd800) ||
        (len === 2 && (code & 0xfc00) === 0xd800 && (char.charCodeAt(1) & 0xfc00) === 0xdc00);
    return valid;
}

export function assertValidUtf16Character(char: string): void {
    if (!isValidUtf16Character(char)) {
        const len = char.length;
        const codes = char
            .slice(0, 2)
            .split('')
            .map((c) => '0x' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4));
        let message: string;
        if (len == 1) {
            message = `Invalid utf16 character, lone surrogate: ${codes[0]}`;
        } else if (len == 2) {
            message = `Invalid utf16 character, not a valid surrogate pair: [${codes.join(', ')}]`;
        } else {
            message = `Invalid utf16 character, must be a single character, found: ${len}`;
        }
        throw new Error(message);
    }
}
