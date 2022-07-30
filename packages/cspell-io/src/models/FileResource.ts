export interface FileResource {
    /**
     * The URL of the File
     */
    url: URL;
    /**
     * The contents of the file
     */
    content: string | Buffer;
    /**
     * The filename of the file if known.
     * Useful for `data:` urls.
     */
    baseFilename?: string | undefined;
}

export interface TextFileResource extends FileResource {
    content: string;
}

export interface BinaryFileResource extends FileResource {
    content: Buffer;
}
