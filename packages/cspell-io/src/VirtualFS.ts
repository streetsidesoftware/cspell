import { createTextFileResource, urlOrReferenceToUrl } from './common/index.js';
import type { CSpellIO } from './CSpellIO.js';
import { getDefaultCSpellIO } from './CSpellIONode.js';
import type {
    BufferEncoding,
    DirEntry,
    Disposable,
    FileReference,
    FileResource,
    Stats,
    TextFileResource,
} from './models/index.js';
import { FileType } from './models/index.js';
import {
    FileSystemProviderInfo,
    FSCapabilities,
    FSCapabilityFlags,
    UrlOrReference,
    VFileSystem,
    VfsDirEntry,
    VfsStat,
} from './VFileSystem.js';

type NextProvider = (url: URL) => VProviderFileSystem | undefined;

const debug = false;

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

class CVirtualFS implements VirtualFS {
    private readonly providers = new Set<VFileSystemProvider>();
    private cachedFs = new Map<string, WrappedProviderFs>();
    private revCacheFs = new Map<VFileSystemProvider, Set<string>>();
    readonly fs: Required<VFileSystem>;
    loggingEnabled = debug;

    constructor() {
        this.fs = fsPassThrough((url) => this._getFS(url));
    }

    enableLogging(value?: boolean | undefined): void {
        this.loggingEnabled = value ?? true;
    }

    log = console.log;
    logEvent = (event: LogEvent) => {
        if (this.loggingEnabled) {
            const id = event.traceID.toFixed(13).replaceAll(/\d{4}(?=\d)/g, '$&.');
            const msg = event.message ? `\n\t\t${event.message}` : '';
            const method = rPad(`${event.method}-${event.event}`, 16);
            this.log(`${method} ID:${id} ts:${event.ts.toFixed(13)} ${chopUrl(event.url)}${msg}`);
        }
    };

    registerFileSystemProvider(...providers: VFileSystemProvider[]): Disposable {
        providers.forEach((provider) => this.providers.add(provider));
        this.reset();
        return {
            dispose: () => {
                for (const provider of providers) {
                    for (const key of this.revCacheFs.get(provider) || []) {
                        this.cachedFs.delete(key);
                    }
                    this.providers.delete(provider) && undefined;
                }
                this.reset();
            },
        };
    }

    getFS(url: URL): VFileSystem {
        return this._getFS(url);
    }

    private _getFS(url: URL): WrappedProviderFs {
        const key = `${url.protocol}${url.hostname}`;

        const cached = this.cachedFs.get(key);
        if (cached) {
            return cached;
        }

        const fnNext = (provider: VFileSystemProvider, next: NextProvider) => {
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

        const fs = new WrappedProviderFs(next(url), this.logEvent);
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
            } catch {
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
            } catch {
                // continue - we are cleaning up.
            }
        }
    }
}

function fsPassThrough(fs: (url: URL) => WrappedProviderFs): Required<VFileSystem> {
    function gfs(ur: UrlOrReference, name: string): VFileSystem {
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
        readDirectory: async (url) =>
            gfs(url, 'readDirectory')
                .readDirectory(url)
                .then((entries) => entries.map((e) => new CVfsDirEntry(e))),
        getCapabilities: (url) => gfs(url, 'getCapabilities').getCapabilities(url),
    };
}

export function createVirtualFS(cspellIO?: CSpellIO): VirtualFS {
    const cspell = cspellIO || getDefaultCSpellIO();
    const vfs = new CVirtualFS();
    vfs.registerFileSystemProvider(cspellIOToFsProvider(cspell));
    return vfs;
}

function cspellIOToFsProvider(cspellIO: CSpellIO): VFileSystemProvider {
    const capabilities = FSCapabilityFlags.Stat | FSCapabilityFlags.ReadWrite | FSCapabilityFlags.ReadDir;
    const capabilitiesHttp = capabilities & ~FSCapabilityFlags.Write & ~FSCapabilityFlags.ReadDir;
    const capMap: Record<string, FSCapabilityFlags> = {
        'file:': capabilities,
        'http:': capabilitiesHttp,
        'https:': capabilitiesHttp,
    };
    const name = 'CSpellIO';
    const supportedProtocols = new Set(['file:', 'http:', 'https:']);
    const fs: VProviderFileSystem = {
        providerInfo: { name },
        stat: (url) => cspellIO.getStat(url),
        readFile: (url) => cspellIO.readFile(url),
        readDirectory: (url) => cspellIO.readDirectory(url),
        writeFile: (file) => cspellIO.writeFile(file.url, file.content),
        dispose: () => undefined,
        capabilities,
        getCapabilities(url) {
            return fsCapabilities(capMap[url.protocol] || FSCapabilityFlags.None);
        },
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

type EventMethods = 'stat' | 'readFile' | 'writeFile' | 'readDir';
type LogEvents = 'start' | 'end' | 'error' | 'other';

interface LogEvent {
    /**
     * The request method
     */
    method: EventMethods;
    event: LogEvents;
    message?: string | undefined;
    /**
     * The trace id can be used to link request and response events.
     * The trace id is unique for a given request.
     */
    traceID: number;
    /**
     * The request url
     */
    url?: URL | undefined;
    /**
     * The time in milliseconds, see `performance.now()`
     */
    ts: number;
}

class WrappedProviderFs implements VFileSystem {
    readonly hasProvider: boolean;
    readonly capabilities: FSCapabilityFlags;
    readonly providerInfo: FileSystemProviderInfo;
    private _capabilities: FSCapabilities;
    constructor(
        private readonly fs: VProviderFileSystem | undefined,
        readonly eventLogger: (event: LogEvent) => void,
    ) {
        this.hasProvider = !!fs;
        this.capabilities = fs?.capabilities || FSCapabilityFlags.None;
        this._capabilities = fsCapabilities(this.capabilities);
        this.providerInfo = fs?.providerInfo || { name: 'unknown' };
    }

    private logEvent(method: EventMethods, event: LogEvents, traceID: number, url: URL, message?: string): void {
        this.eventLogger({ method, event, url, traceID, ts: performance.now(), message });
    }

    getCapabilities(url: URL): FSCapabilities {
        if (this.fs?.getCapabilities) return this.fs.getCapabilities(url);

        return this._capabilities;
    }

    async stat(urlRef: UrlOrReference): Promise<VfsStat> {
        const traceID = performance.now();
        const url = urlOrReferenceToUrl(urlRef);
        this.logEvent('stat', 'start', traceID, url);
        try {
            checkCapabilityOrThrow(this.fs, this.capabilities, FSCapabilityFlags.Stat, 'stat', url);
            return new CVfsStat(await this.fs.stat(urlRef));
        } catch (e) {
            this.logEvent('stat', 'error', traceID, url, e instanceof Error ? e.message : '');
            throw wrapError(e);
        } finally {
            this.logEvent('stat', 'end', traceID, url);
        }
    }

    async readFile(urlRef: UrlOrReference, encoding?: BufferEncoding): Promise<TextFileResource> {
        const traceID = performance.now();
        const url = urlOrReferenceToUrl(urlRef);
        this.logEvent('readFile', 'start', traceID, url);
        try {
            checkCapabilityOrThrow(this.fs, this.capabilities, FSCapabilityFlags.Read, 'readFile', url);
            return createTextFileResource(await this.fs.readFile(urlRef), encoding);
        } catch (e) {
            this.logEvent('readFile', 'error', traceID, url, e instanceof Error ? e.message : '');
            throw wrapError(e);
        } finally {
            this.logEvent('readFile', 'end', traceID, url);
        }
    }

    async readDirectory(url: URL): Promise<VfsDirEntry[]> {
        const traceID = performance.now();
        this.logEvent('readDir', 'start', traceID, url);
        try {
            checkCapabilityOrThrow(this.fs, this.capabilities, FSCapabilityFlags.ReadDir, 'readDirectory', url);
            return (await this.fs.readDirectory(url)).map((e) => new CVfsDirEntry(e));
        } catch (e) {
            this.logEvent('readDir', 'error', traceID, url, e instanceof Error ? e.message : '');
            throw wrapError(e);
        } finally {
            this.logEvent('readDir', 'end', traceID, url);
        }
    }

    async writeFile(file: FileResource): Promise<FileReference> {
        const traceID = performance.now();
        const url = file.url;
        this.logEvent('writeFile', 'start', traceID, url);
        try {
            checkCapabilityOrThrow(this.fs, this.capabilities, FSCapabilityFlags.Write, 'writeFile', file.url);
            return await this.fs.writeFile(file);
        } catch (e) {
            this.logEvent('writeFile', 'error', traceID, url, e instanceof Error ? e.message : '');
            throw wrapError(e);
        } finally {
            this.logEvent('writeFile', 'end', traceID, url);
        }
    }

    static disposeOf(fs: VFileSystem): void {
        fs instanceof WrappedProviderFs && fs.fs?.dispose();
    }
}

function checkCapabilityOrThrow(
    fs: VProviderFileSystem | undefined,
    capabilities: FSCapabilityFlags,
    flag: FSCapabilityFlags,
    name: string,
    url: URL,
): asserts fs is VProviderFileSystem {
    if (!(capabilities & flag)) {
        throw new VFSErrorUnsupportedRequest(name, url);
    }
}

class CFileType {
    constructor(readonly fileType: FileType) {}

    isFile(): boolean {
        return this.fileType === FileType.File;
    }

    isDirectory(): boolean {
        return this.fileType === FileType.Directory;
    }

    isUnknown(): boolean {
        return !this.fileType;
    }

    isSymbolicLink(): boolean {
        return !!(this.fileType & FileType.SymbolicLink);
    }
}

class CVfsStat extends CFileType implements VfsStat {
    constructor(private stat: Stats) {
        super(stat.fileType || FileType.Unknown);
    }

    get size(): number {
        return this.stat.size;
    }

    get mtimeMs(): number {
        return this.stat.mtimeMs;
    }

    get eTag(): string | undefined {
        return this.stat.eTag;
    }
}

class CVfsDirEntry extends CFileType implements VfsDirEntry {
    private _url: URL | undefined;
    constructor(private entry: DirEntry) {
        super(entry.fileType);
    }

    get name(): string {
        return this.entry.name;
    }

    get dir(): URL {
        return this.entry.dir;
    }

    get url(): URL {
        if (this._url) return this._url;
        this._url = new URL(this.entry.name, this.entry.dir);
        return this._url;
    }

    toJSON(): DirEntry {
        return {
            name: this.name,
            dir: this.dir,
            fileType: this.fileType,
        };
    }
}

function chopUrl(url: URL | undefined): string {
    if (!url) return '';
    const href = url.href;
    const parts = href.split('/');
    const n = parts.indexOf('node_modules');
    if (n > 0) {
        const tail = parts.slice(Math.max(parts.length - 3, n + 1));
        return parts.slice(0, n + 1).join('/') + '/…/' + tail.join('/');
    }
    return href;
}

function rPad(str: string, len: number, ch = ' '): string {
    return str + ch.repeat(Math.max(0, len - str.length));
}
