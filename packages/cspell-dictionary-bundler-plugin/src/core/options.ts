import type { FilterPattern } from 'unplugin';

export interface Options {
    include?: FilterPattern | undefined;
    exclude?: FilterPattern | undefined;
    enforce?: 'pre' | 'post' | undefined;
    /**
     * Convert the dictionary to a BTrie format.
     * This will increase the size of the output file, but will significantly reduce the time it takes to load the dictionary.
     * @default true
     */
    convertToBTrie?: boolean | undefined;
    /**
     * The minimum size (in bytes) a dictionary must be to be converted to BTrie format.
     * @default 200
     */
    minConvertSize?: number | undefined;

    /**
     * Compress the inline data using gzip.
     */
    compress?: boolean | undefined;

    debug?: boolean;
}
