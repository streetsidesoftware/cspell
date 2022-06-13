import { Scope } from './scope';

export interface LineOffset extends Line {
    /**
     * offset in characters from the beginning of the line.
     */
    offset: number;
}

export interface Line {
    text: string;
    /** Line number in document, starts with 0 */
    lineNumber: number;
}

export interface LineOffsetAnchored extends LineOffset {
    /** The anchor is the position at the end of the last match */
    anchor: number;
}

export type Groups = Record<string, string | undefined>;

export interface MatchResult {
    /** offset of the match into the input strings */
    index: number;
    /** the input string matched against */
    input: string;
    /**
     * line number of the input string.
     */
    lineNumber: number;
    /**
     * This is the full match
     */
    match: string;
    /**
     * Numbered group matches.
     */
    matches: (string | undefined)[];
    /**
     * Named matching groups.
     */
    groups: Groups;
}

export interface MatchSegment {
    match: string;
    index: number;
    groupNum: number;
    groupName: string | string[] | undefined;
}

export type AppliedScopes = Scope[];

export interface TokenizedLine {
    tokens: TokenizedText[];
    line: Line;
}

export interface TokenizedLineResult extends TokenizedLine {
    parse: (nextLine: Line) => TokenizedLineResult;
}

export interface TokenizedText {
    /**
     * Scopes that were applied
     */
    scope: Scope;
    /**
     * The parsed text
     */
    text: string;
    /**
     * start and end offset of the text.
     */
    range: Range;
}

/**
 * A Range that is relative to the beginning of a line.
 */
export type RangeRelativeToLine = [start: number, end: number, line: number];

/**
 * A Range where the start and end are relative to the beginning of the document.
 */
export type RangeAbsolute = [start: number, end: number];

export type Range = RangeAbsolute | RangeRelativeToLine;
