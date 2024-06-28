import { urlOrReferenceToUrl } from './common/index.js';
import type { CSpellIO } from './CSpellIO.js';
import { getDefaultCSpellIO } from './CSpellIONode.js';
import type { Disposable } from './models/index.js';
import { LogEvent } from './models/LogEvent.js';
import { UrlOrReference, VFileSystem } from './VFileSystem.js';
import { debug, NextProvider, VFileSystemProvider, VirtualFS } from './VirtualFS.js';
import {
    chopUrl,
    cspellIOToFsProvider,
    CVfsDirEntry,
    rPad,
    VFSErrorUnsupportedRequest,
    WrappedProviderFs,
} from './WrappedProviderFs.js';

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
let defaultVirtualFs: VirtualFS | undefined = undefined;

export function getDefaultVirtualFs(): VirtualFS {
    if (!defaultVirtualFs) {
        defaultVirtualFs = createVirtualFS();
    }
    return defaultVirtualFs;
}
