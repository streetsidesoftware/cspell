export interface Options {
    /** Path to SVG file to generate. */
    svg?: string;

    /** Path to the output the Markdown file. */
    output?: string;

    /** The url to prefix svg path when adding it to the  */
    siteUrl?: string;

    /** The number of days in the past to plot. */
    days: number;
}
