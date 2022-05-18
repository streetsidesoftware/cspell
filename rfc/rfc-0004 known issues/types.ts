/** file system path */
export type Path = string;

export interface KnownIssue {
    /**
     * path to file, relative to the containing configuration file.
     */
    path: Path;
    /**
     * Line number or `*` to mean any line.
     *
     * Note: line numbers start with 1
     */
    line: number | '*';
    /**
     * Character offset on the line or `*`
     *
     * Note: the first character on the line is 1
     */
    char: number | '*';
    /**
     * The word causing the issue
     */
    word: string;
}

/**
 * A single line in the known issue file.
 *
 * Formats:
 * - `# Comments start with #`
 * - `<path>:<line>:<char> (<word>)`
 * - `<path>:<line>:<char> (<word>) # optional comment`
 *
 * Example:
 * ```
 * tests/aggregation_regress/tests.py:728:11 (realized)
 * ```
 */
export type KnownIssueLine = string;

export interface KnownIssueFile {
    /**
     * Path to issue file
     */
    path: Path;
}

export type KnownIssuesFiles = (Path | KnownIssueFile)[];
