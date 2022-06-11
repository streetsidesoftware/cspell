export type ParserOptions = Record<string, unknown>;

export type ParserName = string;

export interface Parser {
    /** Name of parser */
    name: ParserName;
    /**
     * Parse Method
     * @param content - full content of the file
     * @param filename - filename
     */
    parse(content: string, filename: string): ParseResult;
}

export interface ParseResult {
    content: string;
    filename: string;
    parsedTexts: Iterable<ParsedText>;
}

export interface ParsedText {
    /**
     * The text extracted and possibly transformed
     */
    text: string;
    /**
     * start and end offsets of the text
     */
    range: Range;
    /**
     * The Scope annotation for a segment of text.
     * Used by the spell checker to apply spell checking options
     * based upon the value of the scope.
     */
    scope?: Scope;
    /**
     * The source map is used to support text transformations.
     *
     * See: {@link SourceMap}
     */
    map?: SourceMap;
    /**
     * Used to delegate parsing the contents of `text` to another parser.
     *
     */
    delegate?: DelegateInfo;
}

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
 * Offsets start a 0
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

export type Range = [start: number, end: number];

/**
 * DelegateInfo is used by a parser to delegate parsing a subsection of a document to
 * another parser. The following information is used by the spell checker to match
 * the parser.
 */
export interface DelegateInfo {
    /**
     * Proposed virtual file name including the extension.
     * Format: `./${source_filename}/${block_number}.${ext}
     * Example: `./README.md/1.js`
     */
    filename: string;
    /**
     * The filename of the origin of the virtual file block.
     * Example: `./README.md`
     */
    originFilename: string;
    /**
     * Proposed file extension
     * Example: `.js`
     */
    extension: string;
    /**
     * Filetype to use
     * Example: `javascript`
     */
    fileType: string;
}

/**
 * Scope - chain of scope going from local to global
 *
 * Example:
 * ```
 * `comment.block.documentation.ts` -> `meta.interface.ts` -> `source.ts`
 * ```
 */
export interface ScopeChain {
    readonly value: string;
    readonly parent?: ScopeChain;
}

/**
 * A string representing a scope chain separated by spaces
 *
 * Example: `comment.block.documentation.ts meta.interface.ts source.ts`
 */
export type ScopeString = string;

export type Scope = ScopeChain | ScopeString;
