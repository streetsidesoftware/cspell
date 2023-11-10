import type { BufferEncoding } from './models/BufferEncoding.js';
import type { FileResource, UrlOrReference } from './models/FileResource.js';
import type { Stats } from './models/index.js';

export interface CSpellIO {
    /**
     * Read a file
     * @param uriOrFilename - uri of the file to read
     * @param encoding - optional encoding.
     * @returns A TextFileResource.
     */
    readFile(uriOrFilename: UrlOrReference, encoding?: BufferEncoding): Promise<FileResource>;
    /**
     * Read a file in Sync mode.
     * Note: `http` requests will fail.
     * @param uriOrFilename - uri of the file to read
     * @param encoding - optional encoding.
     * @returns A TextFileResource.
     */
    readFileSync(uriOrFilename: UrlOrReference, encoding?: BufferEncoding): FileResource;
    /**
     * Write content to a file using utf-8 encoding.
     * It will fail to write to non-file uris.
     * @param uriOrFilename - uri
     * @param content - string to write.
     */
    writeFile(uriOrFilename: UrlOrReference, content: string): Promise<void>;
    /**
     * Get Stats on a uri.
     * @param uriOrFilename - uri to fetch stats on
     * @returns Stats if successful.
     */
    getStat(uriOrFilename: UrlOrReference): Promise<Stats>;
    /**
     * Get Stats on a uri.
     * @param uriOrFilename - uri to fetch stats on
     * @returns Stats if successful, otherwise it throws an error.
     */
    getStatSync(uriOrFilename: UrlOrReference): Stats;
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
    toURL(uriOrFilename: UrlOrReference): URL;
    /**
     * Try to determine the base name of a URL.
     *
     * Note: this handles `data:` URLs with `filename` attribute:
     *
     * Example: `data:text/plain;charset=utf8;filename=hello.txt,Hello` would have a filename of `hello.txt`
     * @param uriOrFilename - string or URL to extract the basename from.
     */
    uriBasename(uriOrFilename: UrlOrReference): string;
    /**
     * Try to determine the directory URL of the uri.
     *
     * @param uriOrFilename - string or URL to extract the basename from.
     */
    uriDirname(uriOrFilename: UrlOrReference): URL;

    // /**
    //  *
    //  * @param uriOrFilename
    //  * @param relativeTo -
    //  */
    // resolveUrl(uriOrFilename: UrlOrFilename, relativeTo: UrlOrFilename): URL;
}
