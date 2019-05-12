import { Observable } from 'rxjs';
import { Sequence } from 'gensequence';
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
export declare function splitCamelCaseWordWithOffsetRx(wo: TextOffset): Observable<TextOffset>;
export declare function splitCamelCaseWordWithOffset(wo: TextOffset): Array<TextOffset>;
/**
 * Split camelCase words into an array of strings.
 */
export declare function splitCamelCaseWord(word: string): string[];
/**
 * This function lets you iterate over regular expression matches.
 */
export declare function match(reg: RegExp, text: string): Sequence<RegExpExecArray>;
export declare function matchStringToTextOffset(reg: RegExp, text: string): Sequence<TextOffset>;
export declare function matchToTextOffset(reg: RegExp, text: TextOffset): Sequence<TextOffset>;
export declare function extractLinesOfText(text: string): Sequence<TextOffset>;
export declare function extractLinesOfTextRx(text: string): Observable<TextOffset>;
/**
 * Extract out whole words from a string of text.
 */
export declare function extractWordsFromTextRx(text: string): Observable<TextOffset>;
/**
 * Extract out whole words from a string of text.
 */
export declare function extractWordsFromText(text: string): Sequence<TextOffset>;
export declare function extractWordsFromCodeRx(text: string): Observable<TextOffset>;
export declare function extractWordsFromCode(text: string): Sequence<TextOffset>;
export declare function isUpperCase(word: string): boolean;
export declare function isLowerCase(word: string): boolean;
export declare function isFirstCharacterUpper(word: string): boolean;
export declare function isFirstCharacterLower(word: string): boolean;
export declare function ucFirst(word: string): string;
export declare function lcFirst(word: string): string;
export declare function snakeToCamel(word: string): string;
export declare function camelToSnake(word: string): string;
export declare function matchCase(example: string, word: string): string;
export declare function stringToRegExp(pattern: string | RegExp, defaultFlags?: string, forceFlags?: string): RegExp | undefined;
export declare function calculateTextDocumentOffsets(uri: string, doc: string, wordOffsets: TextOffset[]): TextDocumentOffset[];
