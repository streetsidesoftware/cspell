import type { CSpellIO } from './CSpellIO.js';
import { getDefaultCSpellIO } from './CSpellIONode.js';
import type { DirEntry, Disposable, FileReference, FileResource, Stats } from './models/index.js';

type UrlOrReference = URL | FileReference;

type NextProvider = (url: URL) => ProviderFileSystem | undefined;

export interface VirtualFS extends Disposable {
    registerFileSystemProvider(provider: FileSystemProvider): Disposable;

    /**
     * Get the fs for a given url.
     */
    getFS(url: URL): FileSystem;

    /**
     * The file system. All requests will first use getFileSystem to get the file system before making the request.
     */
    readonly fs: Required<FileSystem>;

    /**
     * Clear the cache of file systems.
     */
    reset(): void;
}

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

interface FileSystemProviderInfo {
    name: string;
}

interface FileSystemBase {
    stat(url: UrlOrReference): Stats | Promise<Stats>;
    readFile(url: UrlOrReference): Promise<FileResource>;
    readDirectory(url: URL): Promise<DirEntry[]>;
    writeFile(file: FileResource): Promise<FileReference>;
    /**
     * Information about the provider.
     * It is up to the provider to define what information is available.
     */
    providerInfo: FileSystemProviderInfo;
}

export interface FileSystem extends FileSystemBase {
    getCapabilities(url: URL): FSCapabilities;
    hasProvider: boolean;
}

export interface ProviderFileSystem extends FileSystemBase, Disposable {
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

export interface FileSystemProvider extends Partial<Disposable> {
    /** Name of the Provider */
    name: string;
    /**
     * Get the file system for a given url. The provider is cached based upon the protocol and hostname.
     * @param url - the url to get the file system for.
     * @param next - call this function to get the next provider to try. This is useful for chaining providers that operate on the same protocol.
     */
    getFileSystem(url: URL, next: NextProvider): ProviderFileSystem | undefined;
}

class CVirtualFS implements VirtualFS {
    private readonly providers = new Set<FileSystemProvider>();
    private cachedFs = new Map<string, WrappedProviderFs>();
    private revCacheFs = new Map<FileSystemProvider, Set<string>>();
    readonly fs: Required<FileSystem>;

    constructor() {
        this.fs = fsPassThrough((url) => this._getFS(url));
    }

    registerFileSystemProvider(provider: FileSystemProvider): Disposable {
        this.providers.add(provider);
        this.reset();
        return {
            dispose: () => {
                for (const key of this.revCacheFs.get(provider) || []) {
                    this.cachedFs.delete(key);
                }
                this.providers.delete(provider) && undefined;
            },
        };
    }

    getFS(url: URL): FileSystem {
        return this._getFS(url);
    }

    private _getFS(url: URL): WrappedProviderFs {
        const key = `${url.protocol}${url.hostname}`;

        const cached = this.cachedFs.get(key);
        if (cached) {
            return cached;
        }

        const fnNext = (provider: FileSystemProvider, next: NextProvider) => {
            return (url: URL) => {
                let calledNext = false;
                const fs = provider.getFileSystem(url, (_url) => {
                    calledNext = calledNext || url === _url;
                    return next(_url);
                });
                if (fs) {
                    const s = this.revCacheFs.get(provider) || new Set<string>();
                    s.add(key);
                    this.revCacheFs.set(provider, s);
                    return fs;
                }
                if (!calledNext) {
                    return next(url);
                }
                return undefined;
            };
        };

        let next: NextProvider = (_url: URL) => undefined;

        for (const provider of this.providers) {
            next = fnNext(provider, next);
        }

        const fs = new WrappedProviderFs(next(url));
        this.cachedFs.set(key, fs);
        return fs;
    }

    reset(): void {
        this.cachedFs.clear();
        this.revCacheFs.clear();
        this.disposeOfCachedFs();
    }

    private disposeOfCachedFs(): void {
        for (const [key, fs] of [...this.cachedFs].reverse()) {
            try {
                WrappedProviderFs.disposeOf(fs);
            } catch (e) {
                // continue - we are cleaning up.
            }
            this.cachedFs.delete(key);
        }
        this.cachedFs.clear();
    }

    dispose(): void {
        this.disposeOfCachedFs();
        const providers = [...this.providers].reverse();
        for (const provider of providers) {
            try {
                provider.dispose?.();
            } catch (e) {
                // continue - we are cleaning up.
            }
        }
    }
}

function fsPassThrough(fs: (url: URL) => WrappedProviderFs): Required<FileSystem> {
    function gfs(ur: UrlOrReference, name: string): FileSystem {
        const url = urlOrReferenceToUrl(ur);
        const f = fs(url);
        if (!f.hasProvider)
            throw new VFSErrorUnsupportedRequest(
                name,
                url,
                ur instanceof URL ? undefined : { url: ur.url.toString(), encoding: ur.encoding },
            );
        return f;
    }
    return {
        providerInfo: { name: 'default' },
        hasProvider: true,
        stat: async (url) => gfs(url, 'stat').stat(url),
        readFile: async (url) => gfs(url, 'readFile').readFile(url),
        writeFile: async (file) => gfs(file, 'writeFile').writeFile(file),
        readDirectory: async (url) => gfs(url, 'readDirectory').readDirectory(url),
        getCapabilities: (url) => gfs(url, 'getCapabilities').getCapabilities(url),
    };
}

function urlOrReferenceToUrl(urlOrReference: UrlOrReference): URL {
    return urlOrReference instanceof URL ? urlOrReference : urlOrReference.url;
}

export function createVirtualFS(cspellIO?: CSpellIO): VirtualFS {
    const cspell = cspellIO || getDefaultCSpellIO();
    const vfs = new CVirtualFS();
    vfs.registerFileSystemProvider(cspellIOToFsProvider(cspell));
    return vfs;
}

function cspellIOToFsProvider(cspellIO: CSpellIO): FileSystemProvider {
    const name = 'CSpellIO';
    const supportedProtocols = new Set(['file:', 'http:', 'https:']);
    const fs: ProviderFileSystem = {
        providerInfo: { name },
        stat: (url) => cspellIO.getStat(url),
        readFile: (url) => cspellIO.readFile(url),
        readDirectory: (url) => cspellIO.readDirectory(url),
        writeFile: (file) => cspellIO.writeFile(file.url, file.content),
        dispose: () => undefined,
        capabilities: FSCapabilityFlags.Stat | FSCapabilityFlags.ReadWrite | FSCapabilityFlags.ReadDir,
    };

    return {
        name,
        getFileSystem: (url, _next) => {
            return supportedProtocols.has(url.protocol) ? fs : undefined;
        },
    };
}

let defaultVirtualFs: VirtualFS | undefined = undefined;

export function getDefaultVirtualFs(): VirtualFS {
    if (!defaultVirtualFs) {
        defaultVirtualFs = createVirtualFS();
    }
    return defaultVirtualFs;
}

function wrapError(e: unknown): unknown {
    if (e instanceof VFSError) return e;
    // return new VFSError(e instanceof Error ? e.message : String(e), { cause: e });
    return e;
}

export class VFSError extends Error {
    constructor(message: string, options?: { cause?: unknown }) {
        super(message, options);
    }
}

export class VFSErrorUnsupportedRequest extends VFSError {
    public readonly url?: string | undefined;

    constructor(
        public readonly request: string,
        url?: URL | string,
        public readonly parameters?: unknown,
    ) {
        super(`Unsupported request: ${request}`);
        this.url = url?.toString();
    }
}

export interface FSCapabilities {
    readonly flags: FSCapabilityFlags;
    readonly readFile: boolean;
    readonly writeFile: boolean;
    readonly readDirectory: boolean;
    readonly writeDirectory: boolean;
    readonly stat: boolean;
}

class CFsCapabilities {
    constructor(readonly flags: FSCapabilityFlags) {}

    get readFile(): boolean {
        return !!(this.flags & FSCapabilityFlags.Read);
    }

    get writeFile(): boolean {
        return !!(this.flags & FSCapabilityFlags.Write);
    }

    get readDirectory(): boolean {
        return !!(this.flags & FSCapabilityFlags.ReadDir);
    }

    get writeDirectory(): boolean {
        return !!(this.flags & FSCapabilityFlags.WriteDir);
    }

    get stat(): boolean {
        return !!(this.flags & FSCapabilityFlags.Stat);
    }
}

export function fsCapabilities(flags: FSCapabilityFlags): FSCapabilities {
    return new CFsCapabilities(flags);
}

class WrappedProviderFs implements FileSystem {
    readonly hasProvider: boolean;
    readonly capabilities: FSCapabilityFlags;
    readonly providerInfo: FileSystemProviderInfo;
    private _capabilities: FSCapabilities;
    constructor(private readonly fs: ProviderFileSystem | undefined) {
        this.hasProvider = !!fs;
        this.capabilities = fs?.capabilities || FSCapabilityFlags.None;
        this._capabilities = fsCapabilities(this.capabilities);
        this.providerInfo = fs?.providerInfo || { name: 'unknown' };
    }

    getCapabilities(url: URL): FSCapabilities {
        if (this.fs?.getCapabilities) return this.fs.getCapabilities(url);

        return this._capabilities;
    }

    async stat(url: UrlOrReference): Promise<Stats> {
        try {
            checkCapabilityOrThrow(
                this.fs,
                this.capabilities,
                FSCapabilityFlags.Stat,
                'stat',
                urlOrReferenceToUrl(url),
            );
            return await this.fs.stat(url);
        } catch (e) {
            throw wrapError(e);
        }
    }

    async readFile(url: UrlOrReference): Promise<FileResource> {
        try {
            checkCapabilityOrThrow(
                this.fs,
                this.capabilities,
                FSCapabilityFlags.Read,
                'readFile',
                urlOrReferenceToUrl(url),
            );
            return await this.fs.readFile(url);
        } catch (e) {
            throw wrapError(e);
        }
    }

    async readDirectory(url: URL): Promise<DirEntry[]> {
        try {
            checkCapabilityOrThrow(this.fs, this.capabilities, FSCapabilityFlags.ReadDir, 'readDirectory', url);
            return await this.fs.readDirectory(url);
        } catch (e) {
            throw wrapError(e);
        }
    }

    async writeFile(file: FileResource): Promise<FileReference> {
        try {
            checkCapabilityOrThrow(this.fs, this.capabilities, FSCapabilityFlags.Write, 'writeFile', file.url);
            return await this.fs.writeFile(file);
        } catch (e) {
            throw wrapError(e);
        }
    }

    static disposeOf(fs: FileSystem): void {
        fs instanceof WrappedProviderFs && fs.fs?.dispose();
    }
}

function checkCapabilityOrThrow(
    fs: ProviderFileSystem | undefined,
    capabilities: FSCapabilityFlags,
    flag: FSCapabilityFlags,
    name: string,
    url: URL,
): asserts fs is ProviderFileSystem {
    if (!(capabilities & flag)) {
        throw new VFSErrorUnsupportedRequest(name, url);
    }
}
