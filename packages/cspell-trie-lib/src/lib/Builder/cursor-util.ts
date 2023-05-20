import type { BuilderCursor } from './BuilderCursor.js';

export function insertWordsAtCursor(cursor: BuilderCursor, words: Iterable<string>) {
    let prevWord = '';
    for (const word of words) {
        const pLen = commonPrefixLen(prevWord, word);
        const stepBack = prevWord.length - pLen;
        cursor.backStep(stepBack);
        for (let i = pLen; i < word.length; ++i) {
            cursor.insertChar(word[i]);
        }
        cursor.markEOW();
        prevWord = word;
    }
    cursor.backStep(prevWord.length);
}

function commonPrefixLen(a: string, b: string): number {
    let i = 0;
    for (i = 0; i < a.length && a[i] === b[i]; ++i) {
        /* empty */
    }
    return i;
}
