import type { TextOffset } from '@cspell/cspell-types';

const maxRadio = 0.5;

/**
 * Try to detect if a string is a random string of characters or is it camel case / snake case words.
 * @param s - string to check
 * @returns true if the string is considered random;
 */
export function isRandomString(s: string, maxNoiseToLengthRatio: number = maxRadio): boolean {
    return scoreRandomString(s) >= maxNoiseToLengthRatio;
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

function _nonLetterRatio(s: string): number {
    return s.replaceAll(/\p{L}/gu, '').length / s.length;
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
