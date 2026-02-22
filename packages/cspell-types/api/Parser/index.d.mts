//#region src/Parser/types.d.ts
/**
* A SourceMap is used to map transform the location of a piece of text back to its original offsets.
* This is necessary in order to report the correct location of a spelling issue.
* An empty source map indicates that it was a 1:1 transformation.
*
* Non-1:1 transformations are considered to be a single segment and cannot be split.
*
* A partial index into a non-linear segments will get mapped to the start of the segment.
*
* To signal a non-1:1 transformation a 0,0 pair can be used in the source map. This indicates that the
* following segment is a non-linear transformation and should not be split.
*
* This is important when multiple transformations have been applied to the same text, and the source map
* is being used to map back to the original text.
*
* For example: `\u00e9` might be transformed to `é` in on transformation and then to html entity `&#233;`.
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
* Node: The trailing 5,5 is not necessary since it is a 1:1 mapping, but it is included for clarity.
*
* <!--- cspell:ignore Bjørvika rvika --->
*/
type SourceMap = number[];
/**
* A range of text in a document.
* The range is inclusive of the start and exclusive of the end.
*/
type Range = readonly [start: number, end: number];
//#endregion
//#region src/Parser/Mapped.d.ts
interface Mapped {
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
  * - map = `[3, 3, 4, 1]`
  *
  * See: {@link SourceMap}
  *
  */
  map?: SourceMap | undefined;
}
//#endregion
//#region src/Parser/parser.d.ts
type ParserOptions = Record<string, unknown>;
type ParserName = string;
interface Parser {
  /** Name of parser */
  readonly name: ParserName;
  /**
  * Parse Method
  * @param content - full content of the file
  * @param filename - filename
  */
  parse(content: string, filename: string): ParseResult;
}
interface ParseResult {
  readonly content: string;
  readonly filename: string;
  readonly parsedTexts: Iterable<ParsedText>;
}
interface ParsedText extends Readonly<Mapped> {
  /**
  * The text extracted and possibly transformed
  */
  readonly text: string;
  /**
  * The raw text before it has been transformed
  */
  readonly rawText?: string | undefined;
  /**
  * The Scope annotation for a segment of text.
  * Used by the spell checker to apply spell checking options
  * based upon the value of the scope.
  */
  readonly scope?: Scope | undefined;
  /**
  * Used to delegate parsing the contents of `text` to another parser.
  *
  */
  readonly delegate?: DelegateInfo | undefined;
}
/**
* DelegateInfo is used by a parser to delegate parsing a subsection of a document to
* another parser. The following information is used by the spell checker to match
* the parser.
*/
interface DelegateInfo {
  /**
  * Proposed virtual file name including the extension.
  * Format: `./${source_filename}/${block_number}.${ext}
  * Example: `./README.md/1.js`
  */
  readonly filename: string;
  /**
  * The filename of the origin of the virtual file block.
  * Example: `./README.md`
  */
  readonly originFilename: string;
  /**
  * Proposed file extension
  * Example: `.js`
  */
  readonly extension: string;
  /**
  * Filetype to use
  * Example: `javascript`
  */
  readonly fileType?: string;
}
/**
* Scope - chain of scope going from local to global
*
* Example:
* ```
* `comment.block.documentation.ts` -> `meta.interface.ts` -> `source.ts`
* ```
*/
interface ScopeChain {
  readonly value: string;
  readonly parent?: ScopeChain | undefined;
}
/**
* A string representing a scope chain separated by spaces
*
* Example: `comment.block.documentation.ts meta.interface.ts source.ts`
*/
type ScopeString = string;
type Scope = ScopeChain | ScopeString;
//#endregion
//#region src/Parser/TextMap.d.ts
type MappedText = Readonly<TransformedText>;
interface TransformedText extends Mapped {
  /**
  * Transformed text with an optional map.
  */
  text: string;
  /**
  * The original text
  */
  rawText?: string | undefined;
}
//#endregion
export { type DelegateInfo, type MappedText, type ParseResult, type ParsedText, type Parser, type ParserName, type ParserOptions, type Range, type Scope, type ScopeChain, type ScopeString, type SourceMap };