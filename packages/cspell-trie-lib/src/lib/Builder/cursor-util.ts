import type { BuilderCursor } from './BuilderCursor.js';

export function insertWordsAtCursor(cursor: BuilderCursor, words: Iterable<string>) {
    let prevWordLetters: string[] = [];
    for (const _word of words) {
        const letters = [..._word];
        const pLen = commonStrPrefix(prevWordLetters, letters);
        const stepBack = prevWordLetters.length - pLen;
        cursor.backStep(stepBack);
        const wLen = letters.length;
        for (let i = pLen; i < wLen; ++i) {
            cursor.insertChar(letters[i]);
        }
        cursor.markEOW();
        prevWordLetters = letters;
    }
    cursor.backStep(prevWordLetters.length);
}

export function commonStringPrefixLen(a: string, b: string): number {
    let i = 0;
    for (i = 0; i < a.length && a[i] === b[i]; ++i) {
        /* empty */
    }
    if (i) {
        // detect second half of a surrogate pair and backup.
        // eslint-disable-next-line unicorn/prefer-code-point
        const c = a.charCodeAt(i) & 0xffff;
        if (c >= 0xdc00 && c <= 0xdfff) {
            --i;
        }
    }
    return i;
}

function commonStrPrefix(a: string[], b: string[]): number {
    let i = 0;
    for (i = 0; i < a.length && a[i] === b[i]; ++i) {
        /* empty */
    }
    return i;
}
