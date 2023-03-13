import * as Text from './text';
import type { AllowedSplitWordsCollection } from './WordsCollection';

export const regExpSpaceOrDash = /[- ]+/g;
export const regExpIsNumber = /^\d+$/;

export function splitCamelCaseIfAllowed(
    word: string,
    allowedWords: AllowedSplitWordsCollection,
    keepCase: boolean
): string[] {
    const split = [...splitCamelCase(word)];
    if (split.length == 1) return adjustCases(split, allowedWords, keepCase);
    const missing = split.find((w) => isUnknown(w, allowedWords));
    if (missing !== undefined) return [word];
    return adjustCases(split, allowedWords, keepCase);
}

function adjustCases(words: string[], allowedWords: AllowedSplitWordsCollection, keepCase: boolean): string[] {
    return words.map((w) => adjustCase(w, allowedWords, keepCase));
}

function adjustCase(word: string, allowedWords: AllowedSplitWordsCollection, keepCase: boolean): string {
    const lc = word.toLowerCase();
    if (!allowedWords.has(lc)) return word;
    if (lc === word) return word;
    if (word.slice(1).toLowerCase() === word.slice(1)) return lc;
    if (!keepCase && word.toUpperCase() === word) return word.toLowerCase();
    return word;
}

function isUnknown(word: string, allowedWords: AllowedSplitWordsCollection): boolean {
    return !allowedWords.has(word) && !allowedWords.has(word.toLowerCase());
}

function splitCamelCase(word: string): Iterable<string> {
    const splitWords = Text.splitCamelCaseWord(word).filter((word) => !regExpIsNumber.test(word));
    // We only want to preserve this: "New York" and not "Namespace DNSLookup"
    if (splitWords.length > 1 && regExpSpaceOrDash.test(word)) {
        return splitWords.flatMap((w) => w.split(regExpSpaceOrDash));
    }
    return splitWords;
}
