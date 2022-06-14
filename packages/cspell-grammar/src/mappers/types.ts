export interface MappedText {
    text: string;
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
    map?: number[] | undefined;
}
