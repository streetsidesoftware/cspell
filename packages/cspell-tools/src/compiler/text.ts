// cSpell:ignore ings ning gimuy

const regExUpperSOrIng = /(\p{Lu}+'?(?:s|ing|ies|es|ings|ed|ning))(?!\p{Ll})/gu;
const regExSplitWords = /([\p{Ll}])([\p{Lu}])/gu;
const regExSplitWords2 = /(\p{Lu})(\p{Lu}\p{Ll})/gu;

const regExpIsLetter = /^\p{L}\p{M}{0,2}$/u;

/**
 * Split camelCase words into an array of strings.
 */
export function splitCamelCaseWord(word: string): string[] {
    const pass1 = word.replaceAll(regExSplitWords, '$1|$2');
    const pass2 = pass1.replaceAll(regExSplitWords2, '$1|$2');
    const pass3 = pass2.replaceAll(/[\d_]+/g, '|');
    return pass3.split('|').filter((a) => !!a);
}

/**
 * Split camelCase words into an array of strings, try to fix English words.
 */
export function splitCamelCaseWordAutoStem(word: string): string[] {
    return splitCamelCaseWord(word.replaceAll(regExUpperSOrIng, tailToLowerCase));
}

function tailToLowerCase(word: string): string {
    const letters = [...word];
    return letters[0] + letters.slice(1).join('').toLowerCase();
}

export function isSingleLetter(c: string): boolean {
    return regExpIsLetter.test(c);
}
