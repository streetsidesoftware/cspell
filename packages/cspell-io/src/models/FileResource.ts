import type { BufferEncoding } from './BufferEncoding.js';
export interface FileReference {
    /**
     * The URL of the File
     */
    readonly url: URL;
    /**
     * The filename of the file if known.
     * Useful for `data:` urls.
     */
    readonly baseFilename?: string | undefined;

    /**
     * The encoding to use when reading the file.
     */
    readonly encoding?: BufferEncoding | undefined;

    /**
     * - `true` if the content had been gzip compressed.
     * - `false` if the content was NOT gzip compressed.
     * - `undefined` if it is unknown
     */
    readonly gz?: boolean | undefined;
}

export interface FileResource extends FileReference {
    /**
     * The contents of the file
     */
    readonly content: string | ArrayBufferView;
}

export interface TextFileResource extends FileResource {
    getText(): string;
}

export type UrlOrFilename = string | URL;

export type UrlOrReference = UrlOrFilename | FileReference;
