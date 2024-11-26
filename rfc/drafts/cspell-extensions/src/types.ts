export interface Context {
    cwd: URL;
    io: VirtualIO;
}

export interface FileContext extends Context {
    /** The URL of the file. */
    file: URL;
    /** It is possible for a file to match multiple file types. */
    filetype: string | string[];
    /** The content of the file. */
    content: string;
}

export interface FileSegmentContext extends Context {
    /** The URL representing the file segment. */
    file: URL;
    /** the file type of the segment. */
    filetype: string | string[];
    /** The content of the file segment. */
    content: string;
    /** The parent context */
    fileContext: FileContext;
    offset: number;
    length: number;
    sourceMap?: string;
}

export interface VirtualIO {
    readFile(url: URL | FileReference): Promise<FileResource>;
    writeFile(file: FileResource): Promise<FileReference>;
}

/** Used with binary data stored in a text file. */
export type EncodingBase64 = 'base64';
/** Used with binary data. */
export type EncodingBinary = 'binary';

export type FileEncoding = 'utf8' | 'utf16le' | 'utf16be' | EncodingBase64 | EncodingBinary;

export interface FileReference {
    url: URL;
    encoding?: FileEncoding;
}

export interface FileResource {
    url: URL;
    encoding?: FileEncoding;
    getText(): string;
    getBytes(): Uint8Array;
}
