export interface Options {
    /** Path to the output the Markdown file. */
    output?: string;

    /** The number of days in the past to plot. */
    days: number;

    /** Path out output the daily csv */
    dailyCsv?: string;
}
