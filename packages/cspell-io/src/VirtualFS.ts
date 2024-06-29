import type { DirEntry, Disposable, FileReference, FileResource, Stats } from './models/index.js';
import type {
    FileSystemProviderInfo,
    FSCapabilities,
    FSCapabilityFlags,
    UrlOrReference,
    VFileSystem,
    VFileSystemCore,
} from './VFileSystem.js';

export type NextProvider = (url: URL) => VProviderFileSystem | undefined;

export const debug = false;

export interface VirtualFS extends Disposable {
    registerFileSystemProvider(provider: VFileSystemProvider, ...providers: VFileSystemProvider[]): Disposable;
    /**
     * Get the fs for a given url.
     */
    getFS(url: URL): VFileSystem;

    /**
     * The file system. All requests will first use getFileSystem to get the file system before making the request.
     */
    readonly fs: Required<VFileSystem>;

    /**
     * The file system core. All requests will first use getFileSystem to get the file system before making the request.
     */
    readonly fsc: Required<VFileSystemCore>;

    /**
     * Clear the cache of file systems.
     */
    reset(): void;

    /**
     * Indicates that logging has been enabled.
     */
    loggingEnabled: boolean;

    enableLogging(value?: boolean): void;
}

export interface VProviderFileSystem extends Disposable {
    readFile(url: UrlOrReference): Promise<FileResource>;
    writeFile(file: FileResource): Promise<FileReference>;
    /**
     * Information about the provider.
     * It is up to the provider to define what information is available.
     */
    providerInfo: FileSystemProviderInfo;
    stat(url: UrlOrReference): Stats | Promise<Stats>;
    readDirectory(url: URL): Promise<DirEntry[]>;
    /**
     * These are the general capabilities for the provider's file system.
     * It is possible for a provider to support more capabilities for a given url by providing a getCapabilities function.
     */
    capabilities: FSCapabilityFlags;

    /**
     * Get the capabilities for a URL. Make it possible for a provider to support more capabilities for a given url.
     * These capabilities should be more restrictive than the general capabilities.
     * @param url - the url to try
     * @returns the capabilities for the url.
     */
    getCapabilities?: (url: URL) => FSCapabilities;
}

export interface VFileSystemProvider extends Partial<Disposable> {
    /** Name of the Provider */
    name: string;
    /**
     * Get the file system for a given url. The provider is cached based upon the protocol and hostname.
     * @param url - the url to get the file system for.
     * @param next - call this function to get the next provider to try. This is useful for chaining providers that operate on the same protocol.
     */
    getFileSystem(url: URL, next: NextProvider): VProviderFileSystem | undefined;
}
