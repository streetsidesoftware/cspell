import { opConcatMap, opMap, pipeSync as pipe } from '@cspell/cspell-pipe';
import type { TextDocumentOffset, TextOffset } from '@cspell/cspell-types';
import { sequenceFromRegExpMatch } from 'gensequence';
import { binarySearch } from './search';
import {
    regExAccents,
    regExAllLower,
    regExAllUpper,
    regExFirstUpper,
    regExIgnoreCharacters,
    regExLines,
    regExSplitWords,
    regExSplitWords2,
    regExUpperSOrIng,
    regExWords,
    regExWordsAndDigits,
} from './textRegex';
import { scanMap } from './util';

export { stringToRegExp } from './textRegex';

// CSpell:ignore ings ning gimuy tsmerge

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
    const wPrime = word.replace(regExUpperSOrIng, (s) => s[0] + s.slice(1).toLowerCase());
    const separator = '_<^*_*^>_';
    const pass1 = wPrime.replace(regExSplitWords, '$1' + separator + '$2');
    const pass2 = pass1.replace(regExSplitWords2, '$1' + separator + '$2');
    return pass2.split(separator);
}

/**
 * This function lets you iterate over regular expression matches.
 */
export function match(reg: RegExp, text: string): Iterable<RegExpExecArray> {
    return sequenceFromRegExpMatch(reg, text);
}

export function matchStringToTextOffset(reg: RegExp, text: string): Iterable<TextOffset> {
    return matchToTextOffset(reg, { text, offset: 0 });
}

export function matchToTextOffset(reg: RegExp, text: TextOffset): Iterable<TextOffset> {
    const textOffset = text;
    const fnOffsetMap = offsetMap(textOffset.offset);
    textOffset.text.matchAll(reg);
    return pipe(
        match(reg, textOffset.text),
        opMap((m) => fnOffsetMap<TextOffset>({ text: m[0], offset: m.index || 0 }))
    );
}

export function extractLinesOfText(text: string): Iterable<TextOffset> {
    return matchStringToTextOffset(regExLines, text);
}

/**
 * Extract out whole words from a string of text.
 */
export function extractWordsFromText(text: string): Iterable<TextOffset> {
    return extractWordsFromTextOffset(textOffset(text));
}

/**
 * Extract out whole words from a string of text.
 */
export function extractWordsFromTextOffset(text: TextOffset): Iterable<TextOffset> {
    const reg = new RegExp(regExWords);
    return matchToTextOffset(reg, cleanTextOffset(text));
}

export function cleanText(text: string): string {
    text = text.replace(regExIgnoreCharacters, (match: string) => ' '.repeat(match.length));
    return text;
}

export function cleanTextOffset(text: TextOffset): TextOffset {
    return {
        text: cleanText(text.text),
        offset: text.offset,
    };
}

/**
 * Extract out whole words and words containing numbers from a string of text.
 */
export function extractPossibleWordsFromTextOffset(text: TextOffset): Iterable<TextOffset> {
    const reg = new RegExp(regExWordsAndDigits);
    return matchToTextOffset(reg, text);
}

export function extractWordsFromCode(text: string): Iterable<TextOffset> {
    return extractWordsFromCodeTextOffset(textOffset(text));
}

export function extractWordsFromCodeTextOffset(textOffset: TextOffset): Iterable<TextOffset> {
    return pipe(extractWordsFromTextOffset(textOffset), opConcatMap(splitCamelCaseWordWithOffset));
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

export function calculateTextDocumentOffsets<T extends TextOffset>(
    uri: string,
    doc: string,
    wordOffsets: T[]
): (TextDocumentOffset & T)[] {
    const lines = [
        -1,
        ...pipe(
            match(/\n/g, doc),
            opMap((a) => a.index)
        ),
        doc.length,
    ];

    let lastRow = -1;
    let lastOffset = doc.length + 1;
    let lastLineRow = -1;
    let lastLine: TextOffset | undefined;

    function findRowCol(offset: number): [number, number] {
        const row = binarySearch(lines, offset, offset >= lastOffset ? lastRow : undefined);
        const col = offset - lines[Math.max(0, row - 1)];
        lastOffset = offset;
        lastRow = row;
        return [row, col];
    }

    function extractLine(row: number): TextOffset {
        const offset = lines[row - 1] + 1;
        const text = doc.slice(offset, lines[row] + 1);
        return { text, offset };
    }

    function calcLine(row: number): TextOffset {
        const last = lastLineRow === row ? lastLine : undefined;
        lastLineRow = row;
        const r = last ?? extractLine(row);
        lastLine = r;
        return r;
    }

    return wordOffsets.map((wo) => {
        const [row, col] = findRowCol(wo.offset);
        return { ...wo, row, col, doc, uri, line: calcLine(row) };
    });
}

export function removeAccents(text: string): string {
    return text.normalize('NFD').replace(regExAccents, '');
}

export const __testing__ = {
    regExWords,
    regExWordsAndDigits,
};
