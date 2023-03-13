import * as Text from './text';
import type { AllowedSplitWordsCollection } from './WordsCollection';

export const regExpSpaceOrDash = /[- ]+/g;
export const regExpIsNumber = /^\d+$/;

export function splitCamelCaseIfAllowed(
    word: string,
    allowedWords: AllowedSplitWordsCollection,
    keepCase: boolean
): string[] {
    const split = [...splitCamelCase(word)].map((a) => (keepCase ? a : a.toLowerCase()));
    const missing = split.find((w) => isUnknown(w, allowedWords));
    if (missing) return [word];
    return split.map((word) => adjustCase(word, keepCase));
}

function adjustCase(word: string, keepCase: boolean): string {
    if (word[0].toLowerCase() == word[0]) return word;
    if (word.slice(1).toLowerCase() === word.slice(1)) return word.toLowerCase();
    if (!keepCase && word.toUpperCase() === word) return word.toLowerCase();
    return word;
}

function isUnknown(word: string, allowedWords: AllowedSplitWordsCollection): boolean {
    return word.length > 3 && !allowedWords.has(word) && !allowedWords.has(word.toLowerCase());
}

function splitCamelCase(word: string): Iterable<string> {
    const splitWords = Text.splitCamelCaseWord(word).filter((word) => !regExpIsNumber.test(word));
    // We only want to preserve this: "New York" and not "Namespace DNSLookup"
    if (splitWords.length > 1 && regExpSpaceOrDash.test(word)) {
        return splitWords.flatMap((w) => w.split(regExpSpaceOrDash));
    }
    return splitWords;
}
