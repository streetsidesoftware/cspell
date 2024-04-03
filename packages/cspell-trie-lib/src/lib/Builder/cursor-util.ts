import type { BuilderCursor } from './BuilderCursor.js';

export function insertWordsAtCursor(cursor: BuilderCursor, words: Iterable<string>) {
    let prevWord = '';
    for (const word of words) {
        const pLen = commonStrPrefix(prevWord, word);
        const stepBack = prevWord.length - pLen;
        cursor.backStep(stepBack);
        const wLen = word.length;
        for (let i = pLen; i < wLen; ++i) {
            cursor.insertChar(word[i]);
        }
        cursor.markEOW();
        prevWord = word;
    }
    cursor.backStep(prevWord.length);
}

export function commonStringPrefixLen(a: string, b: string): number {
    let i = 0;
    for (i = 0; i < a.length && a[i] === b[i]; ++i) {
        /* empty */
    }
    if (i) {
        // detect second half of a surrogate pair and backup.
        const c = a.charCodeAt(i) & 0xffff;
        if (c >= 0xdc00 && c <= 0xdfff) {
            --i;
        }
    }
    return i;
}

function commonStrPrefix(a: string, b: string): number {
    let i = 0;
    for (i = 0; i < a.length && a[i] === b[i]; ++i) {
        /* empty */
    }
    return i;
}
