import { isSingleLetter, splitCamelCaseWord } from './text.js';
import type { AllowedSplitWordsCollection } from './WordsCollection.js';

export const regExpSpaceOrDash = /[- ]+/g;
export const regExpIsNumber = /^\d+$/;

export function splitCamelCaseIfAllowed(
    word: string,
    allowedWords: AllowedSplitWordsCollection,
    keepCase: boolean,
    compoundPrefix: string,
): string[] {
    const split = [...splitCamelCase(word)];
    if (split.length == 1) return adjustCases(split, allowedWords, keepCase);
    const missing = split.some((w) => isUnknown(w, allowedWords));
    if (missing) return [word];
    const wordIndexes = calcWordIndex(word, split);
    const adjusted = adjustCases(split, allowedWords, keepCase);
    return !compoundPrefix
        ? adjusted
        : adjusted.map((w, i) => {
              const { px, sx } = wordIndexes[i];
              const canCompound = w.length > 2;
              const lc = w.toLowerCase();
              const p = canCompound && isSingleLetter(px) ? compoundPrefix : '';
              const s = canCompound && isSingleLetter(sx) ? compoundPrefix : '';
              if (lc.length < 4 || allowedWords.has(w, true)) return p + w + s;
              return p + lc + s;
          });
}

function adjustCases(words: string[], allowedWords: AllowedSplitWordsCollection, keepCase: boolean): string[] {
    return words.map((w) => adjustCase(w, allowedWords, keepCase));
}

function adjustCase(word: string, allowedWords: AllowedSplitWordsCollection, keepCase: boolean): string {
    const lc = word.toLowerCase();
    if (!allowedWords.has(lc, true)) return word;
    if (lc === word) return word;
    if (word.slice(1).toLowerCase() === word.slice(1)) return lc;
    if (!keepCase && word.toUpperCase() === word) return word.toLowerCase();
    return word;
}

function isUnknown(word: string, allowedWords: AllowedSplitWordsCollection): boolean {
    if (word === 'ERROR') {
        return !allowedWords.has(word, false);
    }
    return !allowedWords.has(word, false);
}

function splitCamelCase(word: string): Iterable<string> {
    const splitWords = splitCamelCaseWord(word).filter((word) => !regExpIsNumber.test(word));
    // We only want to preserve this: "New York" and not "Namespace DNSLookup"
    if (splitWords.length > 1 && regExpSpaceOrDash.test(word)) {
        return splitWords.flatMap((w) => w.split(regExpSpaceOrDash));
    }
    return splitWords;
}

interface WordIndex {
    word: string;
    i: number;
    px: string;
    sx: string;
}

function calcWordIndex(word: string, words: string[]): WordIndex[] {
    let i = 0;
    return words.map((w) => {
        const j = word.indexOf(w, i);
        const k = j + w.length;
        const wIndex = { word: w, i: j, px: word[j - 1] || '', sx: word[k] || '' };
        i = k;
        return wIndex;
    });
}
