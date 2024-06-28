import type { BufferEncoding, DirEntry, FileReference, FileResource, Stats, TextFileResource } from './models/index.js';

export type UrlOrReference = URL | FileReference;

export enum FSCapabilityFlags {
    None = 0,
    Stat = 1 << 0,
    Read = 1 << 1,
    Write = 1 << 2,
    ReadWrite = Read | Write,
    ReadDir = 1 << 3,
    WriteDir = 1 << 4,
    ReadWriteDir = ReadDir | WriteDir,
}

export interface FileSystemProviderInfo {
    name: string;
}

export interface VFileSystemCore {
    /**
     * Read a file.
     * @param url - URL to read
     * @param encoding - optional encoding
     * @returns A FileResource, the content will not be decoded. Use `.getText()` to get the decoded text.
     */
    readFile(url: UrlOrReference, encoding?: BufferEncoding): Promise<TextFileResource>;
    /**
     * Write a file
     * @param file - the file to write
     */
    writeFile(file: FileResource): Promise<FileReference>;
    /**
     * Get the stats for a url.
     * @param url - Url to fetch stats for.
     */
    stat(url: UrlOrReference): Promise<VfsStat>;
    /**
     * Read the directory entries for a url.
     * The url should end with `/` to indicate a directory.
     * @param url - the url to read the directory entries for.
     */
    readDirectory(url: URL): Promise<VfsDirEntry[]>;
    /**
     * Get the capabilities for a URL.
     * The capabilities can be more restrictive than the general capabilities of the provider.
     * @param url - the url to try
     */
    getCapabilities(url: URL): FSCapabilities;
    /**
     * Information about the provider.
     * It is up to the provider to define what information is available.
     */
    providerInfo: FileSystemProviderInfo;
    /**
     * Indicates that a provider was found for the url.
     */
    hasProvider: boolean;
}

export interface VFileSystem extends VFileSystemCore {
    findUp(
        name: string | string[] | VFindUpPredicate,
        from: URL,
        options?: VFindUpURLOptions,
    ): Promise<URL | undefined>;
}

export interface FSCapabilities {
    readonly flags: FSCapabilityFlags;
    readonly readFile: boolean;
    readonly writeFile: boolean;
    readonly readDirectory: boolean;
    readonly writeDirectory: boolean;
    readonly stat: boolean;
}

export interface VfsStat extends Stats {
    isDirectory(): boolean;
    isFile(): boolean;
    isUnknown(): boolean;
    isSymbolicLink(): boolean;
}

export interface VfsDirEntry extends DirEntry {
    isDirectory(): boolean;
    isFile(): boolean;
    isUnknown(): boolean;
    isSymbolicLink(): boolean;
}

export type VFindEntryType = 'file' | 'directory' | '!file' | '!directory';

export interface VFindUpURLOptions {
    type?: VFindEntryType;
    stopAt?: URL;
}

export type VFindUpPredicate = (dir: URL) => URL | undefined | Promise<URL | undefined>;
