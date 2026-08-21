/**
 * cspell-junit-reporter settings type definition
 */
export type CSpellJUnitReporterSettings = {
    /**
     * Path to the output JUnit XML file.
     *
     * Relative paths are relative to the current working directory.
     *
     * Special values:
     * - `stdout` - write the XML to `stdout`.
     * - `stderr` - write the XML to `stderr`.
     *
     * @default stdout
     */
    outFile?: string;
    /**
     * Name to use for the root `<testsuites>` element.
     *
     * @default cspell
     */
    suiteName?: string;
};
