import { Sequence, sequenceFromRegExpMatch } from 'gensequence';
import { binarySearch } from './search';
import {
    regExLines,
    regExUpperSOrIng,
    regExSplitWords,
    regExSplitWords2,
    regExWords,
    regExWordsAndDigits,
    regExIgnoreCharacters,
    regExFirstUpper,
    regExAllUpper,
    regExAllLower,
    regExMatchRegExParts,
    regExAccents,
} from './textRegex';
import { scanMap } from './util';

// CSpell:ignore ings ning gimuy tsmerge

export interface TextOffset {
    text: string;
    offset: number;
}

export interface TextDocumentOffset extends TextOffset {
    uri?: string;
    doc: string;
    row: number;
    col: number;
}

export function splitCamelCaseWordWithOffset(wo: TextOffset): Array<TextOffset> {
    return splitCamelCaseWord(wo.text).map(
        scanMap<string, TextOffset>((last, text) => ({ text, offset: last.offset + last.text.length }), {
            text: '',
            offset: wo.offset,
        })
    );
}

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

/**
 * This function lets you iterate over regular expression matches.
 */
export function match(reg: RegExp, text: string): Sequence<RegExpExecArray> {
    return sequenceFromRegExpMatch(reg, text);
}

export function matchStringToTextOffset(reg: RegExp, text: string): Sequence<TextOffset> {
    return matchToTextOffset(reg, { text, offset: 0 });
}

export function matchToTextOffset(reg: RegExp, text: TextOffset): Sequence<TextOffset> {
    const textOffset = text;
    const fnOffsetMap = offsetMap(textOffset.offset);
    return match(reg, textOffset.text).map((m) => fnOffsetMap({ text: m[0], offset: m.index }));
}

export function extractLinesOfText(text: string): Sequence<TextOffset> {
    return matchStringToTextOffset(regExLines, text);
}

/**
 * Extract out whole words from a string of text.
 */
export function extractWordsFromText(text: string): Sequence<TextOffset> {
    return extractWordsFromTextOffset(textOffset(text));
}

/**
 * Extract out whole words from a string of text.
 */
export function extractWordsFromTextOffset(text: TextOffset): Sequence<TextOffset> {
    const reg = new RegExp(regExWords);
    return matchToTextOffset(reg, cleanTextOffset(text));
}

export function cleanText(text: string): string {
    text = text.replace(regExIgnoreCharacters, (match: string) => ' '.repeat(match.length));
    return text;
}

export function cleanTextOffset(text: TextOffset): TextOffset {
    return {
        text: text.text.replace(regExIgnoreCharacters, (match: string) => ' '.repeat(match.length)),
        offset: text.offset,
    };
}

/**
 * Extract out whole words and words containing numbers from a string of text.
 */
export function extractPossibleWordsFromTextOffset(text: TextOffset): Sequence<TextOffset> {
    const reg = new RegExp(regExWordsAndDigits);
    return matchToTextOffset(reg, text);
}

export function extractWordsFromCode(text: string): Sequence<TextOffset> {
    return extractWordsFromCodeTextOffset(textOffset(text));
}

export function extractWordsFromCodeTextOffset(textOffset: TextOffset): Sequence<TextOffset> {
    return extractWordsFromTextOffset(textOffset).concatMap(splitCamelCaseWordWithOffset);
}

export function isUpperCase(word: string): boolean {
    return !!word.match(regExAllUpper);
}

export function isLowerCase(word: string): boolean {
    return !!word.match(regExAllLower);
}

export function isFirstCharacterUpper(word: string): boolean {
    return isUpperCase(word.slice(0, 1));
}

export function isFirstCharacterLower(word: string): boolean {
    return isLowerCase(word.slice(0, 1));
}

export function ucFirst(word: string): string {
    return word.slice(0, 1).toUpperCase() + word.slice(1);
}

export function lcFirst(word: string): string {
    return word.slice(0, 1).toLowerCase() + word.slice(1);
}

export function snakeToCamel(word: string): string {
    return word.split('_').map(ucFirst).join('');
}

export function camelToSnake(word: string): string {
    return splitCamelCaseWord(word).join('_').toLowerCase();
}

export function matchCase(example: string, word: string): string {
    if (example.match(regExFirstUpper)) {
        return word.slice(0, 1).toUpperCase() + word.slice(1).toLowerCase();
    }
    if (example.match(regExAllLower)) {
        return word.toLowerCase();
    }
    if (example.match(regExAllUpper)) {
        return word.toUpperCase();
    }

    if (isFirstCharacterUpper(example)) {
        return ucFirst(word);
    }

    if (isFirstCharacterLower(example)) {
        return lcFirst(word);
    }

    return word;
}

export function textOffset(text: string, offset = 0): TextOffset {
    return { text, offset };
}

export function extractText(textOffset: TextOffset, startPos: number, endPos: number): string {
    const { text, offset: orig } = textOffset;
    const a = Math.max(startPos - orig, 0);
    const b = Math.max(endPos - orig, 0);
    return text.slice(a, b);
}

interface OffsetMap {
    offset: number;
}
function offsetMap(offset: number) {
    return <T extends OffsetMap>(xo: T) => ({ ...xo, offset: xo.offset + offset } as T);
}

export function stringToRegExp(pattern: string | RegExp, defaultFlags = 'gim', forceFlags = 'g'): RegExp | undefined {
    if (pattern instanceof RegExp) {
        return pattern;
    }
    try {
        const [, pat, flag] = [...(pattern.match(regExMatchRegExParts) || ['', pattern, defaultFlags]), forceFlags];
        // Make sure the flags are unique.
        const flags = [...new Set(forceFlags + flag)].join('').replace(/[^gimuy]/g, '');
        if (pat) {
            const regex = new RegExp(pat, flags);
            return regex;
        }
    } catch (e) {
        /* empty */
    }
    return undefined;
}

export function calculateTextDocumentOffsets(
    uri: string,
    doc: string,
    wordOffsets: TextOffset[]
): TextDocumentOffset[] {
    const lines = [-1, ...match(/\n/g, doc).map((a) => a.index), doc.length];

    function findRowCol(offset: number): [number, number] {
        const row = binarySearch(lines, offset);
        const col = offset - lines[Math.max(0, row - 1)];
        return [row, col];
    }

    return wordOffsets.map((wo) => {
        const [row, col] = findRowCol(wo.offset);
        return { ...wo, row, col, doc, uri };
    });
}

export function removeAccents(text: string): string {
    return text.normalize('NFD').replace(regExAccents, '');
}

export const __testing__ = {
    regExWords,
    regExWordsAndDigits,
};
