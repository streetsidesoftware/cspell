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
    text.toLowerCase().normalize('NFD').replaceAll(/\p{M}/gu, '');
/**
 * generate case insensitive forms of a word
 * @param text - text to convert
 * @param locale - the locale whose case rules are used to lower-case the text. Default rules are used if not given.
 * @returns the forms of the word.
 */

export const normalizeWordForCaseInsensitive = (text: string, locale?: string): string[] => {
    const t = locale ? text.toLocaleLowerCase(locale) : text.toLowerCase();
    return [t, t.normalize('NFD').replaceAll(/\p{M}/gu, '')];
};
