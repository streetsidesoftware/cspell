import { createTextFileResource, urlOrReferenceToUrl } from './common/index.js';
import type { CSpellIO } from './CSpellIO.js';
import type { BufferEncoding, DirEntry, FileReference, FileResource, Stats, TextFileResource } from './models/index.js';
import { FileType } from './models/index.js';
import type { EventMethods, LogEvent, LogEvents } from './models/LogEvent.js';
import {
    FileSystemProviderInfo,
    FSCapabilities,
    FSCapabilityFlags,
    UrlOrReference,
    VFileSystem,
    VfsDirEntry,
    VfsStat,
} from './VFileSystem.js';
import { VFileSystemProvider, VProviderFileSystem } from './VirtualFS.js';

export function cspellIOToFsProvider(cspellIO: CSpellIO): VFileSystemProvider {
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
export class WrappedProviderFs implements VFileSystem {
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
export class CVfsDirEntry extends CFileType implements VfsDirEntry {
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
export function chopUrl(url: URL | undefined): string {
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
export function rPad(str: string, len: number, ch = ' '): string {
    return str.padEnd(len, ch);
}
