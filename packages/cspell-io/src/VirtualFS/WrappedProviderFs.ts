import { createTextFileResource, urlOrReferenceToUrl } from '../common/index.js';
import type { CSpellIO } from '../CSpellIO.js';
import type { BufferEncoding, DirEntry, FileReference, FileResource, TextFileResource } from '../models/index.js';
import type { EventMethods, LogEvent, LogEvents } from '../models/LogEvent.js';
import { fsCapabilities } from './capabilities.js';
import { CFileType } from './CFileType.js';
import { CVfsStat } from './CVfsStat.js';
import { VFSError, VFSErrorUnsupportedRequest } from './errors.js';
import type {
    FileSystemProviderInfo,
    FSCapabilities,
    ReadFileOptions,
    UrlOrReference,
    VFileSystemCore,
    VfsDirEntry,
    VfsStat,
} from './VFileSystem.js';
import { FSCapabilityFlags } from './VFileSystem.js';
import type { VFileSystemProvider, VProviderFileSystem } from './VirtualFS.js';

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
        readFile: (url, options) => cspellIO.readFile(url, options),
        readDirectory: (url) => cspellIO.readDirectory(url),
        writeFile: (file) => cspellIO.writeFile(file.url, file.content),
        dispose: () => undefined,
        capabilities,
        getCapabilities(url) {
            return fsCapabilities(capMap[url.protocol] || FSCapabilityFlags.None);
        },
        [Symbol.dispose]() {},
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

export class WrappedProviderFs implements VFileSystemCore {
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

    async readFile(
        urlRef: UrlOrReference,
        optionsOrEncoding?: BufferEncoding | ReadFileOptions,
    ): Promise<TextFileResource> {
        const traceID = performance.now();
        const url = urlOrReferenceToUrl(urlRef);
        this.logEvent('readFile', 'start', traceID, url);
        try {
            checkCapabilityOrThrow(this.fs, this.capabilities, FSCapabilityFlags.Read, 'readFile', url);
            const readOptions = toOptions(optionsOrEncoding);
            return createTextFileResource(await this.fs.readFile(urlRef, readOptions), readOptions?.encoding);
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

    static disposeOf<V extends VFileSystemCore>(fs: V): void {
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

/**
 * Chop URL at node_modules to make it more readable in logs. If the URL contains `node_modules`, the
 * chopped URL will include the part before `node_modules`, followed by `…`, and then the last 3 parts
 * of the URL. If the URL does not contain `node_modules`, the original URL href will be returned.
 * @param url - the URL to chop.
 * @returns string - the chopped URL, if the URL contains node_modules, otherwise the original URL href.
 */
export function chopUrlAtNodeModules(url: URL | undefined): string {
    if (!url) return '';
    const href = url.href;
    const parts = href.split('/');
    const n = parts.indexOf('node_modules');
    if (n > 0) {
        const tail = parts.slice(n + 1);
        if (tail.length <= 3) {
            return href;
        }
        const head = parts.slice(0, n + 1);
        return head.join('/') + '/…/' + tail.slice(-3).join('/');
    }
    return href;
}

export function rPad(str: string, len: number, ch = ' '): string {
    return str.padEnd(len, ch);
}

function toOptions(val: BufferEncoding | ReadFileOptions | undefined): ReadFileOptions | undefined {
    return typeof val === 'string' ? { encoding: val } : val;
}
