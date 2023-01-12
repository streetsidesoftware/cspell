/**
 * Normalize word unicode.
 * @param text - text to normalize
 * @returns returns a word normalized to `NFC`
 */

export const normalizeWord = (text: string): string => text.normalize();
/**
 * converts text to lower case and removes any accents.
 * @param text - text to convert
 * @returns lowercase word without accents
 * @deprecated true
 */

export const normalizeWordToLowercase = (text: string): string =>
    text.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
/**
 * generate case insensitive forms of a word
 * @param text - text to convert
 * @returns the forms of the word.
 */

export const normalizeWordForCaseInsensitive = (text: string): string[] => {
    const t = text.toLowerCase();
    return [t, t.normalize('NFD').replace(/\p{M}/gu, '')];
};
