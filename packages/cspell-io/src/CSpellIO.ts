import type { Stats } from './models';
import { BufferEncoding } from './models/BufferEncoding';
import type { TextFileResource } from './models/FileResource';

export interface CSpellIO {
    /**
     * Read a file
     * @param uriOrFilename - uri of the file to read
     * @param encoding - optional encoding.
     * @returns A TextFileResource.
     */
    readFile(uriOrFilename: string | URL, encoding?: BufferEncoding): Promise<TextFileResource>;
    /**
     * Read a file in Sync mode.
     * Note: `http` requests will fail.
     * @param uriOrFilename - uri of the file to read
     * @param encoding - optional encoding.
     * @returns A TextFileResource.
     */
    readFileSync(uriOrFilename: string | URL, encoding?: BufferEncoding): TextFileResource;
    /**
     * Write content to a file using utf-8 encoding.
     * It will fail to write to non-file uris.
     * @param uriOrFilename - uri
     * @param content - string to write.
     */
    writeFile(uriOrFilename: string | URL, content: string): Promise<void>;
    /**
     * Get Stats on a uri.
     * @param uriOrFilename - uri to fetch stats on
     * @returns Stats if successful.
     */
    getStat(uriOrFilename: string | URL): Promise<Stats>;
    /**
     * Get Stats on a uri.
     * @param uriOrFilename - uri to fetch stats on
     * @returns Stats if successful, otherwise it throws an error.
     */
    getStatSync(uriOrFilename: string | URL): Stats;
    /**
     * Compare two Stats.
     * @param left - left stat
     * @param right - right stat
     * @returns 0 if they are equal and non-zero if they are not.
     */
    compareStats(left: Stats, right: Stats): number;
    /**
     * Convert a string to a URL
     * @param uriOrFilename - string or URL to convert.
     *   If it is a URL, then it is just returned as is.
     */
    toURL(uriOrFilename: string | URL): URL;
    /**
     * Try to determine the base name of a URL.
     *
     * Note: this handles `data:` URLs with `filename` attribute:
     *
     * Example: `data:text/plain;charset=utf8;filename=hello.txt,Hello` would have a filename of `hello.txt`
     * @param uriOrFilename - string or URL to extract the basename from.
     */
    uriBasename(uriOrFilename: string | URL): string;
    /**
     * Try to determine the directory URL of the uri.
     *
     * @param uriOrFilename - string or URL to extract the basename from.
     */
    uriDirname(uriOrFilename: string | URL): URL;
}
