export type TextMap = Readonly<TransformedText>;

export type Range = readonly [start: number, end: number];

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

interface TransformedText extends PartialOrUndefined<Mapped> {
    /**
     * Transformed text with an optional map.
     */
    text: string;

    /**
     * The original text
     */
    rawText?: string | undefined;

    /**
     * The start and end offset of the text in the document.
     */
    range: Range;
}
type PartialOrUndefined<T> = {
    [P in keyof T]?: T[P] | undefined;
};
