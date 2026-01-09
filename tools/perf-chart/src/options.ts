export interface Options {
    /** Path to SVG file to generate. */
    svg?: string;

    /** Path to PNG file to generate. */
    png?: string;

    /** Path to the output the Markdown file. */
    output?: string;

    /** The url to prefix svg / png path when adding it to the markdown */
    siteUrl?: string;

    /** The number of days in the past to plot. */
    days: number;
}
