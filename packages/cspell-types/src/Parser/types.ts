/**
 * A SourceMap is used to map transform a piece of text back to its original text.
 * This is necessary in order to report the correct location of a spelling issue.
 * An empty source map indicates that it was a 1:1 transformation.
 *
 * The values in a source map are number pairs (even, odd) relative to the beginning of each
 * string segment.
 * - even - offset in the source text
 * - odd - offset in the transformed text
 *
 * Offsets start at 0
 *
 * Example:
 *
 * - Original text: `Grand Caf\u00e9 Bj\u00f8rvika`
 * - Transformed text: `Grand Café Bjørvika`
 * - Map: [9, 9, 15, 10, 18, 13, 24, 14]
 *
 * | offset | original    | offset | transformed |
 * | ------ | ----------- | ------ | ----------- |
 * | 0-9    | `Grand Caf` | 0-9    | `Grand Caf` |
 * | 9-15   | `\u00e9`    | 9-10   | `é`         |
 * | 15-18  | ` Bj`       | 10-13  | ` Bj`       |
 * | 18-24  | `\u00f8`    | 13-14  | `ø`         |
 * | 24-29  | `rvika`     | 14-19  | `rvika`     |
 *
 * <!--- cspell:ignore Bjørvika rvika --->
 */
export type SourceMap = number[];

/**
 * A range of text in a document.
 * The range is inclusive of the start and exclusive of the end.
 */
export type Range = readonly [start: number, end: number];
