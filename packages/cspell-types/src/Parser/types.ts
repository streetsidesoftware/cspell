/**
 * A SourceMap is used to map or transform the location of a piece of text back to its original offsets.
 * This is necessary in order to report the correct location of a spelling issue.
 * An empty source map indicates that it was a 1:1 transformation.
 *
 * Non-1:1 transformations are considered to be a single segment and cannot be split.
 *
 * A partial index into a non-linear segment will get mapped to the start of the segment.
 *
 * To signal a non-1:1 transformation a 0,0 pair can be used in the source map. This indicates that the
 * following segment is a non-linear transformation and should not be split.
 *
 * This is important when multiple transformations have been applied to the same text, and the source map
 * is being used to map back to the original text.
 *
 * For example: `\u00e9` might be transformed to `é` in one transformation and then to HTML entity `&#233;`.
 * The resulting sourceMap would be `[..., 0, 0, 6, 6, ...]` to indicate that the 6 character segment should
 * not be split when mapping back to the original text.
 *
 * The values in a source map are number pairs (even, odd) relative to the beginning of each
 * string segment.
 * - even - span length in the source text
 * - odd - span length in the transformed text
 *
 * Offsets start at 0
 *
 * Example:
 *
 * - Original text: `Grand Caf\u00e9 Bj\u00f8rvika`
 * - Transformed text: `Grand Café Bjørvika`
 * - Map: [9, 9, 6, 1, 3, 3, 6, 1, 5, 5]
 *
 * | offset | span | original    | offset | span | transformed |
 * | ------ | ---- | ----------- | ------ | ---- | ----------- |
 * | 0-9    |    9 | `Grand Caf` | 0-9    |    9 | `Grand Caf` |
 * | 9-15   |    6 | `\u00e9`    | 9-10   |    1 | `é`         |
 * | 15-18  |    3 | ` Bj`       | 10-13  |    3 | ` Bj`       |
 * | 18-24  |    6 | `\u00f8`    | 13-14  |    1 | `ø`         |
 * | 24-29  |    5 | `rvika`     | 14-19  |    5 | `rvika`     |
 *
 * Note: The trailing 5,5 is not necessary since it is a 1:1 mapping, but it is included for clarity.
 *
 * <!--- cspell:ignore Bjørvika rvika --->
 */
export type SourceMap = number[];

/**
 * A range of text in a document.
 * The range is inclusive of the start and exclusive of the end.
 */
export type Range = readonly [start: number, end: number];
