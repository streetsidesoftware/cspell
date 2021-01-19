// cSpell:ignore ings ning gimuy

const regExUpperSOrIng = /(\p{Lu}+'?(?:s|ing|ies|es|ings|ed|ning))(?!\p{Ll})/gu;
const regExSplitWords = /(\p{Ll})(\p{Lu})/gu;
const regExSplitWords2 = /(\p{Lu})(\p{Lu}\p{Ll})/gu;

/**
 * Split camelCase words into an array of strings.
 */
export function splitCamelCaseWord(word: string): string[] {
    const wPrime = word.replace(regExUpperSOrIng, (s) => s[0] + s.substr(1).toLowerCase());
    const separator = '_<^*_*^>_';
    const pass1 = wPrime.replace(regExSplitWords, '$1' + separator + '$2');
    const pass2 = pass1.replace(regExSplitWords2, '$1' + separator + '$2');
    return pass2.split(separator);
}
