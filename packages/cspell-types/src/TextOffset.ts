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
    length?: number;
}

export type Range = readonly [start: number, end: number];

export interface TextMap {
    /**
     * The text found at the offset. If the text has been transformed, then the length might not match `end - start`.
     * Example: Original: `cafe\u0301`, text: `café`
     */
    readonly srcTxt: string;
    /**
     * The start and end offset of the text in the document.
     */
    readonly srcRange: Range;
    /**
     * Optional mapping from the raw text in the document.
     */
    readonly srcMap?: readonly number[] | undefined;
}

export interface TextDocumentOffset extends TextOffset {
    uri?: string;
    doc: string;
    row: number;
    col: number;
    line: TextOffset;
}

export interface Mapped {
    /**
     * `(i, j)` number pairs where
     * - `i` is the offset in the source
     * - `j` is the offset in the destination
     *
     * Example:
     * - source text = `"caf\xe9"`
     * - mapped text = `"café"`
     * - map = `[3, 3, 7, 4]`, which is equivalent to `[0, 0, 3, 3, 7, 4]`
     *   where the `[0, 0]` is unnecessary.
     *
     */
    map: number[];
}

export interface TransformedText extends Partial<Mapped> {
    /**
     * Transformed text with an optional map.
     */
    text: string;
}
