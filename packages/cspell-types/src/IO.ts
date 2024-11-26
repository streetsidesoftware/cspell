export interface FileResource {
    url: URL;
    getText(): string;
    getBytes(): Uint8Array;
}

export interface VirtualFileSystem {
    readFile(url: URL): Promise<FileResource>;
}
