import { isSingleLetter, lowerCase, splitCamelCaseWord } from './text.ts';
import type { AllowedSplitWordsCollection } from './WordsCollection.ts';

export const regExpSpaceOrDash: RegExp = /[- ]+/g;
export const regExpIsNumber: RegExp = /^\d+$/;

export function splitCamelCaseIfAllowed(
    word: string,
    allowedWords: AllowedSplitWordsCollection,
    keepCase: boolean,
    compoundPrefix: string,
    minCompoundLength: number,
    locale?: string | undefined,
): string[] {
    const split = [...splitCamelCase(word)];
    if (split.length === 1) return adjustCases(split, allowedWords, keepCase, locale);
    const missing = split.some((w) => isUnknown(w, allowedWords));
    if (missing) return [word];
    const wordIndexes = calcWordIndex(word, split);
    const adjusted = adjustCases(split, allowedWords, keepCase, locale);
    return !compoundPrefix
        ? adjusted
        : adjusted.map((w, i) => {
              const { px, sx } = wordIndexes[i];
              const canCompound = w.length >= minCompoundLength;
              const lc = lowerCase(w, locale);
              const p = canCompound && isSingleLetter(px) ? compoundPrefix : '';
              const s = canCompound && isSingleLetter(sx) ? compoundPrefix : '';
              if (lc.length < 4 || allowedWords.has(w, true)) return p + w + s;
              return p + lc + s;
          });
}

function adjustCases(
    words: string[],
    allowedWords: AllowedSplitWordsCollection,
    keepCase: boolean,
    locale: string | undefined,
): string[] {
    return words.map((w) => adjustCase(w, allowedWords, keepCase, locale));
}

function adjustCase(
    word: string,
    allowedWords: AllowedSplitWordsCollection,
    keepCase: boolean,
    locale: string | undefined,
): string {
    const lc = lowerCase(word, locale);
    if (!allowedWords.has(lc, true)) return word;
    if (lc === word) return word;
    if (word.slice(1).toLowerCase() === word.slice(1)) return lc;
    if (!keepCase && word.toUpperCase() === word) return lc;
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
