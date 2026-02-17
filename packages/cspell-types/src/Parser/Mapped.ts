import type { Range, SourceMap } from './types.js';

export interface Mapped {
    /**
     * The absolute start and end offset of the text in the source.
     */
    range: Range;

    /**
     * `(i, j)` number pairs where
     * - `i` is the offset in the source relative to the start of the range
     * - `j` is the offset in the transformed destination
     *
     * Example:
     * - source text = `"caf\xe9"`
     * - mapped text = `"café"`
     * - map = `[3, 3, 7, 4]`, which is equivalent to `[0, 0, 3, 3, 7, 4]`
     *   where the `[0, 0]` is unnecessary.
     *
     * See: {@link SourceMap}
     *
     */
    map?: SourceMap | undefined;
}
