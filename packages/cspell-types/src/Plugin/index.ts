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
) => Promise<DocumentParser | undefined> | DocumentParser | undefined;

/**
 * @since 10.4.0
 */
export interface AvailableParsers<Options> {
    /**
     * A collection of available parsers keyed by name.
     * Each entry can be a `DocumentParser` instance, a `Parser` instance, or a `CreateParser` function.
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
export interface CSpellPlugin {
    /**
     * This is the name of the plugin.
     */
    name?: string;

    /**
     * List of parsers provided by the plugin.
     * Each entry can be either a `DocumentParser` instance or a `Parser` definition.
     * @since 6.2.0
     */
    parsers?: Parsers;
}

/**
 * Extended Plugin API that supports parser creation and available parsers.
 *
 * Not yet in use.
 * @since 10.4.0
 */
export interface CSpellPluginEx<Options = unknown> extends CSpellPlugin {
    /**
     * This is the name of the plugin.
     */
    name: string;

    /**
     * Ask the plugin to create a parser.
     * @param name - The name of the parser to create.
     * @param options - Plugin options to be passed to the parser creation function.
     * @returns A parser instance or undefined if not available.
     * @since 10.4.0
     */
    createParser?: CreateParser<Options> | undefined;

    /**
     * A collection of available parsers provided by the plugin.
     * Each key is the name of the parser, and the value can be a `DocumentParser` instance, a `Parser` instance, or a `CreateParser` function.
     * @since 10.4.0
     */
    availableParsers?: AvailableParsers<Options>;
}
