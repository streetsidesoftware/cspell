import { Line } from './types';

export interface ParseLineResult {
    parsedText: ParsedText[];
    line: Line;
    parse: (nextLine: Line) => ParseLineResult;
}

export type TextScope = string;

export interface ParsedText {
    /**
     * Scopes that were applied
     */
    scope: TextScope[];
    /**
     * The parsed text
     */
    text: string;
    /**
     * Offset from the beginning of the line
     */
    offset: number;
    /**
     * Offset maps if the text was transformed
     */
    map?: number[];
}

export interface DocumentParser {
    parse: (firstLine: string) => ParseLineResult;
}
