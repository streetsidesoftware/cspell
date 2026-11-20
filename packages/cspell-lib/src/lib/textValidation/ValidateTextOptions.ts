import type { StopAtLocation } from '../Settings/index.js';

export interface ValidateTextOptions {
    /**
     * Generate suggestions where there are spelling issues.
     */
    generateSuggestions?: boolean;

    /**
     * The number of suggestions to generate. The higher the number the longer it takes.
     */
    numSuggestions?: number;

    /**
     * Verify that the in-document directives are correct.
     */
    validateDirectives?: boolean;
    /**
     * Skips spell checking the document. Useful for testing and dry runs.
     * It will read the configuration and parse the document.
     */
    skipValidation?: boolean;
}

/**
 * Options for checking a document, shared by `spellCheckDocument` and `DocumentValidator`.
 */
export interface ValidateDocumentOptions extends ValidateTextOptions {
    /**
     * Optional path to a configuration file.
     * If given, it will be used instead of searching for a configuration file.
     */
    configFile?: string;
    /**
     * Prevents searching for local configuration files
     * By default the spell checker looks for configuration files
     * starting at the location of given filename.
     * If `configFile` is defined it will still be loaded instead of searching.
     * `false` will override the value in `settings.noConfigSearch`.
     * @defaultValue undefined
     */
    noConfigSearch?: boolean;

    /**
     * Directories where the search for the document's configuration file stops.
     *
     * The search starts in the document's directory and moves up one directory at a time, up to the file system root.
     * It stops sooner at the first stop directory it reaches:
     * - A `URL`, or a {@link StopAtLocation} without `exclusive`, is inclusive: a configuration file in that directory
     *   is still found.
     * - A {@link StopAtLocation} with `exclusive: true` stops without looking in that directory.
     *
     * A URL that doesn't end in `/` is taken as a file, and the search stops at its directory.
     *
     * It has no effect when `configFile` is set, or when `noConfigSearch` disables the search.
     */
    stopConfigSearchAt?: readonly (URL | StopAtLocation)[] | undefined;

    /**
     * If true, the document will be checked even if it would normally be excluded.
     */
    forceCheck?: boolean;
}
