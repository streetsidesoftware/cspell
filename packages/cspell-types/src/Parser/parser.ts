import type { Mapped } from './Mapped.js';
import type { TextDocument } from './types.js';

export type ParserOptions = Record<string, unknown>;

export type ParserName = string;

export interface Parser {
    /** Name of parser */
    readonly name: ParserName;

    /**
     * Parse Method
     * @param document - the text document to parse
     */
    parseDocument?: ParseDocument;

    /**
     * Parse Method
     * @param content - full content of the file
     * @param filename - filename
     */
    parse(content: string, filename: string): ParseResult;
}

export type ParseDocument = (document: TextDocument) => ParseResult;
// | ((document: TextDocument) => Promise<ParseResult>)
// | ((document: TextDocument) => ParseResult | Promise<ParseResult>);

export interface DocumentParser {
    /** Name of parser */
    readonly name: ParserName;

    /**
     * Parse Method
     * @param document - the text document to parse
     */
    parseDocument: ParseDocument;

    /**
     * Parse Method
     * @param content - full content of the file
     * @param filename - filename
     */
    parse?: (content: string, filename: string) => ParseResult;
}

export interface ParseResult {
    /**
     * The full content of the file being parsed.
     * Optionally returned by the parser.
     * For performance reasons, the parser may choose not to return the full content.
     */
    readonly content?: string | undefined;
    /**
     * The name of the file being parsed.
     * Optionally returned by the parser.
     */
    readonly filename?: string | undefined;
    readonly parsedTexts: Iterable<ParsedText>;
}

export interface ParsedText extends Readonly<Mapped> {
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
     * The tags associated with this segment of text.
     */
    readonly tags?: Readonly<ParsedTags> | undefined;
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
export interface DelegateInfo {
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
export interface ScopeChain {
    readonly value: string;
    readonly parent?: ScopeChain | undefined;
}

/**
 * A string representing a scope chain separated by spaces
 *
 * Example: `comment.block.documentation.ts meta.interface.ts source.ts`
 */
export type ScopeString = string;

export type Scope = ScopeChain | ScopeString;

export type ParsedTag = boolean | string | undefined;

/**
 * ParsedTags represents a collection of tags associated with a segment of text. Each tag can have a boolean, string, or undefined value.
 *
 * - `undefined` represents a tag that is not set.
 * - `boolean` represents a tag that is either true or false.
 * - `string` represents a tag with a string value.
 */
export interface ParsedTags {
    readonly [tag: string]: ParsedTag;
}
