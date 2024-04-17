// cSpell:ignore ings ning gimuy

const regExUpperSOrIng = /(\p{Lu}+'?(?:s|ing|ies|es|ings|ed|ning))(?!\p{Ll})/gu;
const regExSplitWords = /([\p{Ll}])([\p{Lu}])/gu;
const regExSplitWords2 = /(\p{Lu})(\p{Lu}\p{Ll})/gu;

/**
 * Split camelCase words into an array of strings.
 */
export function splitCamelCaseWord(word: string, autoStem = true): string[] {
    const wPrime = autoStem ? word.replaceAll(regExUpperSOrIng, (s) => s[0] + s.slice(1).toLowerCase()) : word;
    const pass1 = wPrime.replaceAll(regExSplitWords, '$1|$2');
    const pass2 = pass1.replaceAll(regExSplitWords2, '$1|$2');
    const pass3 = pass2.replaceAll(/[\d_]+/g, '|');
    return pass3.split('|').filter((a) => !!a);
}
