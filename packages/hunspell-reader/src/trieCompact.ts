import * as Rx from 'rx';

const baseCountAscii = '0'.charCodeAt(0);
export const multiDeleteChar = '=';
export const singleDeleteChar = '_';
const maxMultiCount = 64;
const endOfWord = '\n';
const escapeChar = '~';
const escapeRegex = /[~=_]/g;
const unescapeRegex = /~([~=_])/g;
const multiDeleteMaxCountChar = multiDeleteChar + String.fromCharCode(baseCountAscii + maxMultiCount);

/**
 * Give a list of sorted words, output edit fragments to transform from the previous word to the next.
 *
 * @export
 * @param {Rx.Observable<string>} words
 * @returns {Rx.Observable<string>}
 */
export function trieCompactSortedWordList(words: Rx.Observable<string>): Rx.Observable<string> {
    return words
        .map(escapeLetters)
        .scan((acc, word) => {
            const { prevWord } = acc;
            let len;
            for (len = prevWord.length; prevWord.slice(0, len) !== word.slice(0, len); --len) {};
            const diff = prevWord.length - len;
            const emit = (diff ? calcBackSpaceEmit(diff) : (prevWord.length ? endOfWord : ''))
                + word.slice(len);
            return { emit, prevWord: word };
        }, { emit: '', prevWord: '' })
        .map(acc => acc.emit)
        .filter(word => word !== endOfWord);  // remove duplicate words.
}

/**
 * Take a stream of edit fragments and build up a list of word.
 *
 * @export
 * @param {Rx.Observable<string>} stream
 * @returns {Rx.Observable<string>}
 */
export function trieCompactExtract(stream: Rx.Observable<string>): Rx.Observable<string> {
    // We add a endOfWord to the end of the stream to make sure the last word is emitted.
    return Rx.Observable.from([stream, Rx.Observable.just(endOfWord)])
        .concatAll()
        .concatMap(a => a) // get one letter at a time.
        .scan((acc, char) => {
            let { word, isMultiDelete, canEmit } = acc;
            let emit = '';
            const lastLetter = word.slice(-1);
            const step = lastLetter === escapeChar ? null : char;
            switch (step) {
                case singleDeleteChar:
                    emit = canEmit ? word : '';
                    canEmit = false;
                    word = word.slice(0, -1);
                    break;
                case multiDeleteChar:
                    isMultiDelete = true;
                    emit = canEmit ? word : '';
                    canEmit = false;
                    break;
                case endOfWord:
                    emit = word;
                    canEmit = false;
                    break;
                default:
                    if (isMultiDelete) {
                        word = word.slice(0, baseCountAscii - char.charCodeAt(0));
                        isMultiDelete = false;
                    } else {
                        word += char;
                        canEmit = true;
                    }
            }
            return { emit, word, isMultiDelete, canEmit };
        }, { emit: '', word: '', isMultiDelete: false, canEmit: false })
        .map(acc => acc.emit)
        .map(unescapeLetters)
        .filter(word => !!word)
        ;
}

/**
 * generate the backspace character sequence that matches the number of characters to delete.
 *
 * @export
 * @param {number} len
 * @returns {string}
 */
export function calcBackSpaceEmit(len: number) {
    let emit = '';

    if (len) {
        while (len > maxMultiCount) {
            emit += multiDeleteMaxCountChar;
            len -= maxMultiCount;
        }
        if (len) {
            if (len === 1) {
                emit += singleDeleteChar;
            } else {
                emit += multiDeleteChar + String.fromCharCode(baseCountAscii + len);
            }
        }
    }

    return emit;
}

/**
 * The inverse of calcBackSpaceEmit
 *
 * @export
 * @param {string} sequence
 * @returns {number}
 */
export function backSpaceEmitSequenceToLength(sequence: string) {
    let n = 0;
    let offset = 0;
    let more = true;
    while (more) {
        switch (sequence.slice(offset, offset + 1)) {
            default:
                more = false;
                break;
            case singleDeleteChar:
                n += 1;
                offset += 1;
                break;
            case multiDeleteChar:
                offset += 1;
                n += sequence.charCodeAt(offset) - baseCountAscii;
                offset += 1;
                break;
        }
    }

    return { length: n, offset };
}

export function escapeLetters(letters: string): string {
    return letters.replace(escapeRegex, `${escapeChar}$&`);
}

export function unescapeLetters(letters: string): string {
    return letters.replace(unescapeRegex, '$1');
}
