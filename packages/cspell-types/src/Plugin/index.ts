import type { DocumentParser, Parser } from '../Parser/index.js';

export type CreateParser<Options = unknown> = (
    /**
     * The name of the parser to create.
     */
    name: string,
    /**
     * The options to be passed to the parser creation function.
     * These options are defined by the Plugin.
     */
    options?: Options,
) => Promise<DocumentParser> | DocumentParser;

/**
 * @since 10.4.0
 */
export interface AvailableParsers<Options> {
    /**
     * The value can be a `DocumentParser` instance, a `Parser` instance, a string, or a boolean.
     * If the value is a string or boolean,
     */
    [name: string]: DocumentParser | Parser | CreateParser<Options>;
}

/**
 * @since 10.4.0
 */
export type Parsers = (DocumentParser | Parser)[];

/**
 * Plugin API
 * @experimental
 * @since 6.2.0
 */
export interface CSpellPlugin<Options = unknown> {
    /**
     * Ask the plugin to create a parser.
     * @param name The name of the parser to create.
     * @param options
     * @returns A parser instance or undefined if
     * @since 10.4.0
     */
    createParser?: (name: string, options?: Options) => Promise<DocumentParser> | DocumentParser | undefined;

    /**
     * A collection of available parsers provided by the plugin.
     * Each key is the name of the parser, and the value can be a `DocumentParser` instance, a `Parser` instance, or a `CreateParser` function.
     * @since 10.4.0
     */
    availableParsers?: AvailableParsers<Options>;

    /**
     * List of parsers provided by the plugin.
     * Each entry can be either a `DocumentParser` instance or a `Parser` definition.
     * @since 6.2.0
     */
    parsers?: Parsers;
}
