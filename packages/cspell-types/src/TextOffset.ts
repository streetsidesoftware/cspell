export interface TextOffset {
    /**
     * The text found at the offset. If the text has been transformed, then the length might not match `length`.
     * Example: Original: `cafe\u0301`, text: `café`
     */
    text: string;
    /**
     * The offset into the document.
     */
    offset: number;
    /**
     * Assumed to match `text.length` if the text has not been transformed.
     */
    length?: number | undefined;
}

export interface TextDocumentOffset extends TextOffset {
    uri?: string | undefined;
    doc: string;
    row: number;
    col: number;
    line: TextOffset;
}
