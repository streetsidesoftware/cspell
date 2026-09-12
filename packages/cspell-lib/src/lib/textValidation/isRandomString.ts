import type { TextOffset } from '@cspell/cspell-types';

import { softHyphen } from '../util/wordSplitter/index.js';

const maxRadio = 0.5;

/**
 * Try to detect if a string is a random string of characters or is it camel case / snake case words.
 * @param s - string to check
 * @returns true if the string is considered random;
 */
export function isRandomString(s: string, maxNoiseToLengthRatio: number = maxRadio): boolean {
    // Soft hyphen indicates a word break, so it's likely not a random string.
    if (s.includes(softHyphen)) return false;
    if (scoreRandomString(s) >= maxNoiseToLengthRatio) return true;
    // `categorizeString` collapses an unbroken run of one letter-case (no digits, no
    // case changes) into a single token, so a purely alphabetic random token - e.g. a
    // lowercase-only slug/session id - scores near 0 no matter how random it is. Catch
    // that case separately by looking for a run of consonants too long to plausibly be
    // a real word.
    return hasImplausibleConsonantRun(s);
}

/**
 * Calculate the ratio of noise to the length of the string.
 * @param s - string to check
 * @returns true if the string is considered random;
 */
export function scoreRandomString(s: string): number {
    if (!s.length) return 0;
    const n = categorizeString(s);
    return n.length / s.length; // * 0.75 + (1 - scoreLongWordRatio(s)) * 0.25 + nonLetterRatio(s) * 0.25;
}

export function scoreLongWordRatio(s: string): number {
    return sumWordLengths(s) / s.length;
}

function sumWordLengths(s: string): number {
    let total = 0;
    for (const w of s.matchAll(/\p{Lu}\p{Ll}{3,}|\p{Ll}{4,}|\p{Lu}{4,}/gu)) {
        total += w[0].length;
    }
    return total;
}

export function categorizeString(s: string): string {
    const n = s
        .replaceAll(/\d+/g, '0')
        .replaceAll(/\p{Ll}\p{M}+/gu, 'a')
        .replaceAll(/\p{Lu}\p{M}+/gu, 'A')
        .replaceAll(/\p{Lu}?\p{Ll}+/gu, '1')
        .replaceAll(/\p{Lu}+/gu, '2')
        .replaceAll(/\p{M}/gu, '4')
        .replaceAll('_', '')
        .replaceAll(/[-_.']+/g, '3');
    return n;
}

const vowelsLower = new Set(['a', 'e', 'i', 'o', 'u', 'y']);
const wordRunRegex = /[A-Z]?[a-z]+|[A-Z]+/g;
const MIN_RUN_LENGTH_TO_CHECK = 8;
const CONSONANT_RUN_THRESHOLD = 7;

/**
 * Detect a single-case alphabetic run (the same word-like tokens `categorizeString`
 * collapses to one token) that contains a longer run of consecutive consonants than
 * real words plausibly have. Calibrated against `/usr/share/dict/words`: at this
 * threshold essentially no real English word triggers it, while most random
 * alphabetic strings of secret-length (20+ chars) do.
 */
export function hasImplausibleConsonantRun(s: string): boolean {
    for (const m of s.matchAll(wordRunRegex)) {
        const run = m[0];
        if (run.length >= MIN_RUN_LENGTH_TO_CHECK && maxConsonantRun(run) >= CONSONANT_RUN_THRESHOLD) {
            return true;
        }
    }
    return false;
}

function maxConsonantRun(word: string): number {
    let maxRun = 0;
    let run = 0;
    for (const ch of word.toLowerCase()) {
        if (vowelsLower.has(ch)) {
            run = 0;
            continue;
        }
        run += 1;
        if (run > maxRun) maxRun = run;
    }
    return maxRun;
}

const hexLowerRegex = /^[0-9a-f]+$/;
const hexUpperRegex = /^[0-9A-F]+$/;

export function isHexNumber(s: string): boolean {
    return hexLowerRegex.test(s) || hexUpperRegex.test(s);
}

const hexSequence = /(?:\b|(?<=[\W_]))[0-9a-fA-F][-0-9a-fA-F]*[0-9a-fA-F](?:\b|(?=[\W_]))/g;
const isLetter = /\p{L}/uy;

function isLetterAt(s: string, idx: number): boolean {
    isLetter.lastIndex = idx;
    return isLetter.test(s);
}

const MIN_HEX_SEQUENCE_LENGTH = 4;

export function extractHexSequences(s: string, minLength: number = MIN_HEX_SEQUENCE_LENGTH): TextOffset[] {
    return [...s.matchAll(hexSequence)]
        .filter(
            (m) =>
                m[0].length >= minLength &&
                (m.index === 0 || !isLetterAt(s, m.index - 1)) &&
                !isLetterAt(s, m.index + m[0].length),
        )
        .map((m) => ({ text: m[0], offset: m.index }));
}
