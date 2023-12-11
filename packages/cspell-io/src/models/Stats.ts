/**
 * Subset of definition from the Node definition to avoid a dependency upon a specific version of Node
 */
export interface Stats {
    /**
     * Size of file in byes, -1 if unknown.
     */
    size: number;
    /**
     * Modification time, 0 if unknown.
     */
    mtimeMs: number;
    /**
     * Used by web requests to see if a resource has changed.
     */
    eTag?: string | undefined;

    /**
     * The file type.
     */
    fileType?: FileType | undefined;
}

export enum FileType {
    /**
     * The file type is unknown.
     */
    Unknown = 0,
    /**
     * A regular file.
     */
    File = 1,
    /**
     * A directory.
     */
    Directory = 2,
}

export interface DirEntry {
    url: URL;
    fileType: FileType;
}
