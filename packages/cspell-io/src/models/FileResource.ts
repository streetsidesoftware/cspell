import type { BufferEncoding } from './BufferEncoding.js';
export interface FileReference {
    /**
     * The URL of the File
     */
    url: URL;
}

export interface FileResource extends FileReference {
    /**
     * The contents of the file
     */
    content: string | ArrayBufferView;
    /**
     * The filename of the file if known.
     * Useful for `data:` urls.
     */
    baseFilename?: string | undefined;
    /**
     * - `true` if the content had been gzip compressed.
     * - `false` if the content was NOT gzip compressed.
     * - `undefined` if it is unknown
     */
    gz?: boolean;
    /**
     * The encoding used.
     */
    encoding?: BufferEncoding;
}

export interface TextFileResource extends FileResource {
    content: string;
    /**
     * The encoding used to decode the file.
     */
    encoding: BufferEncoding;
}

export interface BinaryFileResource extends FileResource {
    content: ArrayBufferView;
}
