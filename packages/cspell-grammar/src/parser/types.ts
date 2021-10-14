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
