/**
 * CSpell-json-reporter settings type definition
 */
export type CSpellJSONReporterSettings = {
    /**
     * Output JSON file path
     */
    outFile: string;
    /**
     * Add more information about the files being checked and the configuration
     * @default false
     */
    verbose?: boolean;
    /**
     * Add information useful for debugging cspell.json files
     * @default false
     */
    debug?: boolean;
    /**
     * Add progress messages
     * @default false
     */
    progress?: boolean;
};
