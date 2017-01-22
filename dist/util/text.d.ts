import * as Rx from 'rxjs/Rx';
import { Sequence } from 'gensequence';
export interface WordOffset {
    word: string;
    offset: number;
}
export interface TextOffset {
    text: string;
    offset: number;
}
export declare type STW = string | TextOffset | WordOffset;
export declare function splitCamelCaseWordWithOffsetRx(wo: WordOffset): Rx.Observable<WordOffset>;
export declare function splitCamelCaseWordWithOffset(wo: WordOffset): Array<WordOffset>;
/**
 * Split camelCase words into an array of strings.
 */
export declare function splitCamelCaseWord(word: string): string[];
/**
 * Extract out whole words from a string of text.
 */
export declare function extractWordsFromText1(text: string): WordOffset[];
/**
 * This function lets you iterate over regular expression matches.
 */
export declare function match(reg: RegExp, text: string): Sequence<RegExpExecArray>;
export declare function matchToTextOffset(reg: RegExp, text: STW): Sequence<TextOffset>;
export declare function matchToWordOffset(reg: RegExp, text: STW): Sequence<WordOffset>;
export declare function extractLinesOfText(text: STW): Sequence<TextOffset>;
export declare function extractLinesOfTextRx(text: string): Rx.Observable<TextOffset>;
/**
 * Extract out whole words from a string of text.
 */
export declare function extractWordsFromTextRx(text: string): Rx.Observable<WordOffset>;
/**
 * Extract out whole words from a string of text.
 */
export declare function extractWordsFromText(text: string): Sequence<WordOffset>;
export declare function extractWordsFromCodeRx(text: string): Rx.Observable<WordOffset>;
export declare function extractWordsFromCode(text: string): Sequence<WordOffset>;
export declare function isUpperCase(word: string): boolean;
export declare function isLowerCase(word: string): boolean;
export declare function isFirstCharacterUpper(word: string): boolean;
export declare function isFirstCharacterLower(word: string): boolean;
export declare function ucFirst(word: string): string;
export declare function lcFirst(word: string): string;
export declare function snakeToCamel(word: string): string;
export declare function camelToSnake(word: string): string;
export declare function matchCase(example: string, word: string): string;
export declare function isTextOffset(x: any): x is TextOffset;
export declare function isWordOffset(x: any): x is WordOffset;
export declare function toWordOffset(text: string | WordOffset | TextOffset): WordOffset;
export declare function toTextOffset(text: string | WordOffset | TextOffset): TextOffset;
export declare function stringToRegExp(pattern: string | RegExp, defaultFlags?: string, forceFlags?: string): RegExp | undefined;
