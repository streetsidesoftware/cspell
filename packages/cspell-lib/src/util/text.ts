import { xregexp as XRegExp } from 'cspell-util-bundle';
import {Sequence, sequenceFromRegExpMatch } from 'gensequence';
import {binarySearch} from './search';
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

const regExLines = /.*(\r?\n|$)/g;
// const regExIdentifiers = XRegExp('(?:\\p{L}|[0-9_\'])+', 'gi');
const regExUpperSOrIng = XRegExp('(\\p{Lu}+\\\\?[\'’]?(?:s|ing|ies|es|ings|ed|ning))(?!\\p{Ll})', 'g');
const regExSplitWords = XRegExp('(\\p{Ll})(\\p{Lu})', 'g');
const regExSplitWords2 = XRegExp('(\\p{Lu})(\\p{Lu}\\p{Ll})', 'g');
const regExWords = XRegExp("\\p{L}(?:\\\\?['’]\\p{L}|\\p{L})+|\\p{L}", 'g');
const regExIgnoreCharacters = XRegExp('\\p{Hiragana}|\\p{Han}|\\p{Katakana}|[\\u30A0-\\u30FF]|[\\p{Hangul}]', 'g');
const regExFirstUpper = XRegExp('^\\p{Lu}\\p{Ll}+$');
const regExAllUpper = XRegExp('^\\p{Lu}+$');
const regExAllLower = XRegExp('^\\p{Ll}+$');

const regExMatchRegExParts = /^\/(.*)\/([gimuy]*)$/;

const regExAccents = XRegExp('\\p{M}', 'g');

export function splitCamelCaseWordWithOffset(wo: TextOffset): Array<TextOffset> {
    return splitCamelCaseWord(wo.text)
        .map(scanMap<string, TextOffset>(
            (last, text) => ({ text, offset: last.offset + last.text.length }),
            { text: '', offset: wo.offset }
        ));
}

/**
 * Split camelCase words into an array of strings.
 */
export function splitCamelCaseWord(word: string): string[] {
    const wPrime = word.replace(regExUpperSOrIng, s => s[0] + s.substr(1).toLowerCase());
    const separator = '_<^*_*^>_';
    const pass1 = XRegExp.replace(wPrime, regExSplitWords, '$1' + separator + '$2');
    const pass2 = XRegExp.replace(pass1, regExSplitWords2, '$1' + separator + '$2');
    return XRegExp.split(pass2, separator);
}

/**
 * This function lets you iterate over regular expression matches.
 */
export function match(reg: RegExp, text: string): Sequence<RegExpExecArray> {
    return sequenceFromRegExpMatch(reg, text);
}

export function matchStringToTextOffset(reg: RegExp, text: string) {
    return matchToTextOffset(reg, { text, offset: 0 });
}

export function matchToTextOffset(reg: RegExp, text: TextOffset): Sequence<TextOffset> {
    const textOffset = text;
    const fnOffsetMap = offsetMap(textOffset.offset);
    return match(reg, textOffset.text)
        .map(m => fnOffsetMap({ text: m[0], offset: m.index }));
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
    const reg = XRegExp(regExWords);
    const reg2 = XRegExp(regExWords);
    return matchToTextOffset(reg, text)
        // remove characters that match against \p{L} but are not letters (Chinese characters are an example).
        .map(({ text, offset }) => ({
            text: XRegExp.replace(text, regExIgnoreCharacters, (match: string) => ' '.repeat(match.length)),
            offset,
        }))
        .concatMap(wo => matchToTextOffset(reg2, wo))
        .filter(wo => !!wo.text);
}

export function extractWordsFromCode(text: string): Sequence<TextOffset> {
    return extractWordsFromCodeTextOffset(textOffset(text));
}

export function extractWordsFromCodeTextOffset(textOffset: TextOffset): Sequence<TextOffset> {
    return extractWordsFromTextOffset(textOffset)
        .concatMap(splitCamelCaseWordWithOffset);
}

export function isUpperCase(word: string) {
    return !!word.match(regExAllUpper);
}

export function isLowerCase(word: string) {
    return !!word.match(regExAllLower);
}

export function isFirstCharacterUpper(word: string) {
    return isUpperCase(word.slice(0, 1));
}

export function isFirstCharacterLower(word: string) {
    return isLowerCase(word.slice(0, 1));
}

export function ucFirst(word: string) {
    return word.slice(0, 1).toUpperCase() + word.slice(1);
}

export function lcFirst(word: string) {
    return word.slice(0, 1).toLowerCase() + word.slice(1);
}

export function snakeToCamel(word: string) {
    return word.split('_').map(ucFirst).join('');
}

export function camelToSnake(word: string) {
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

export function textOffset(text: string, offset: number = 0): TextOffset {
    return { text, offset };
}

export function extractText(textOffset: TextOffset, startPos: number, endPos: number) {
    const { text, offset: orig } = textOffset;
    const a = Math.max(startPos - orig, 0);
    const b = Math.max(endPos - orig, 0);
    return text.slice(a, b);
}

interface OffsetMap {
    offset: number;
}
function offsetMap(offset: number) {
    return <T extends OffsetMap>(xo: T) => ({...(xo as Object), offset: xo.offset + offset }) as T;
}

export function stringToRegExp(pattern: string | RegExp, defaultFlags = 'gim', forceFlags = 'g') {
    if (pattern instanceof RegExp) {
        return pattern;
    }
    try {
        const [, pat, flag] = [...(pattern.match(regExMatchRegExParts) || ['', pattern, defaultFlags]), forceFlags];
        // Make sure the flags are unique.
        const flags = [...(new Set(forceFlags + flag))].join('').replace(/[^gimuy]/g, '');
        if (pat) {
            const regex = new RegExp(pat, flags);
            return regex;
        }
    } catch (e) {
    }
    return undefined;
}

export function calculateTextDocumentOffsets(uri: string, doc: string, wordOffsets: TextOffset[]): TextDocumentOffset[] {
    const lines = [-1, ...match(/\n/g, doc).map(a => a.index), doc.length];

    function findRowCol(offset: number): [number, number] {
        const row = binarySearch(lines, offset);
        const col = offset - lines[Math.max(0, row - 1)];
        return [row, col];
    }

    return wordOffsets
        .map(wo => {
            const [row, col] = findRowCol(wo.offset);
            return { ...wo, row, col, doc, uri };
        });
}

export function removeAccents(text: string) {
    return text.normalize('NFKD').replace(regExAccents, '');
}
