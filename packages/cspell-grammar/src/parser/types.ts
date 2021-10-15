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

export type Scope = string;

export type AppliedScopes = Scope[];

export interface TokenRange {
    scope: AppliedScopes;
    start: number;
    end: number;
}
