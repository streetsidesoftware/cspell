import { urlOrReferenceToUrl } from '../common/index.js';
import type { Disposable } from '../models/index.js';
import { type FileReference, type FileResource, FileType, type Stats } from '../models/index.js';
import { VFSNotFoundError, VFSNotSupported } from './errors.js';
import type { FileSystemProviderInfo, UrlOrReference, VfsDirEntry } from './VFileSystem.js';
import { FSCapabilityFlags } from './VFileSystem.js';
import type { VFileSystemProvider, VProviderFileSystem, VProviderFileSystemReadFileOptions } from './VirtualFS.js';

export class MemFileSystemProvider implements VFileSystemProvider, Disposable {
    readonly name: string;
    readonly protocol: string;
    #vfs: MemVFileSystem;

    /**
     * @param name - the name of the provider, used for debugging and logging.
     * @param protocol - the protocol (end with a :), examples: `vfs:`, `cspell-vfs:`
     */
    constructor(name: string, protocol: string) {
        this.name = name;
        this.protocol = protocol;
        this.#vfs = new MemVFileSystem(name, protocol);
    }

    getFileSystem(url: URL): VProviderFileSystem | undefined {
        if (url.protocol !== this.protocol) {
            return undefined;
        }
        return this.#vfs;
    }

    get memFS(): MemVFileSystem {
        return this.#vfs;
    }

    dispose(): void {
        this.#vfs.dispose();
    }

    [Symbol.dispose](): void {
        this.dispose();
    }
}

interface MemVFileSystemEntry {
    file: FileResource;
    stats: Stats;
}

export class MemVFileSystem implements VProviderFileSystem {
    readonly name: string;
    readonly protocol: string;
    readonly capabilities: FSCapabilityFlags = FSCapabilityFlags.ReadWrite | FSCapabilityFlags.Stat;
    #files: Map<string, MemVFileSystemEntry> = new Map();

    constructor(name: string, protocol: string) {
        this.name = name;
        this.protocol = protocol;
        this.providerInfo = { name };
        this.#files = new Map();
    }

    /**
     * Read a file.
     * @param url - URL to read
     * @param options - options for reading the file.
     * @returns A FileResource, the content will not be decoded. Use `.getText()` to get the decoded text.
     */
    async readFile(url: UrlOrReference, _options?: VProviderFileSystemReadFileOptions): Promise<FileResource> {
        return this.#getEntryOrThrow(url).file;
    }

    /**
     * Write a file
     * @param file - the file to write
     */
    async writeFile(file: FileResource): Promise<FileReference> {
        const stats: Stats = {
            size: file.content.length,
            mtimeMs: performance.now(),
            fileType: FileType.File,
        };
        const u = urlOrReferenceToUrl(file);
        this.#files.set(u.href, { file, stats });
        return { url: file.url };
    }

    /**
     * Get the stats for a url.
     * @param url - Url to fetch stats for.
     */
    stat(url: UrlOrReference): Stats {
        return this.#getEntryOrThrow(url).stats;
    }

    #getEntryOrThrow(url: UrlOrReference): MemVFileSystemEntry {
        const u = urlOrReferenceToUrl(url);
        const found = this.#files.get(u.href);
        if (!found) {
            throw new VFSNotFoundError(u);
        }
        return found;
    }

    /**
     * Read the directory entries for a url.
     * The url should end with `/` to indicate a directory.
     * @param url - the url to read the directory entries for.
     */
    async readDirectory(url: URL): Promise<VfsDirEntry[]> {
        throw new VFSNotSupported('readDirectory', url);
    }

    /**
     * Information about the provider.
     * It is up to the provider to define what information is available.
     */
    readonly providerInfo: FileSystemProviderInfo;
    readonly hasProvider: boolean = true;

    dispose(): void {
        this.#files.clear();
    }

    [Symbol.dispose](): void {
        this.dispose();
    }
}
