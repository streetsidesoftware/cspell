import * as Rx from 'rx';
export declare const multiDeleteChar = "=";
export declare const singleDeleteChar = "_";
/**
 * Give a list of sorted words, output edit fragments to transform from the previous word to the next.
 *
 * @export
 * @param {Rx.Observable<string>} words
 * @returns {Rx.Observable<string>}
 */
export declare function trieCompactSortedWordList(words: Rx.Observable<string>): Rx.Observable<string>;
/**
 * Take a stream of edit fragments and build up a list of word.
 *
 * @export
 * @param {Rx.Observable<string>} stream
 * @returns {Rx.Observable<string>}
 */
export declare function trieCompactExtract(stream: Rx.Observable<string>): Rx.Observable<string>;
/**
 * generate the backspace character sequence that matches the number of characters to delete.
 *
 * @export
 * @param {number} len
 * @returns {string}
 */
export declare function calcBackSpaceEmit(len: number): string;
/**
 * The inverse of calcBackSpaceEmit
 *
 * @export
 * @param {string} sequence
 * @returns {number}
 */
export declare function backSpaceEmitSequenceToLength(sequence: string): {
    length: number;
    offset: number;
};
export declare function escapeLetters(letters: string): string;
export declare function unescapeLetters(letters: string): string;
