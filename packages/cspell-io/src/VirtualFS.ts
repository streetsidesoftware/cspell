import type { CSpellIO } from './CSpellIO.js';
import { getDefaultCSpellIO } from './CSpellIONode.js';
import type { DirEntry, Disposable, FileReference, FileResource, Stats } from './models/index.js';

type UrlOrReference = URL | FileReference;

type NextProvider = (url: URL) => FileSystem | undefined;

export interface VirtualFS extends Disposable {
    registerFileSystemProvider(provider: FileSystemProvider): Disposable;

    /**
     * Get the fs for a given url.
     */
    getFS(url: URL): FileSystem | undefined;

    /**
     * The file system. All requests will first use getFileSystem to get the file system before making the request.
     */
    readonly fs: Required<FileSystem>;

    /**
     * Clear the cache of file systems.
     */
    reset(): void;
}

export interface FileSystem extends Disposable {
    stat(url: UrlOrReference): Stats | Promise<Stats>;
    readFile(url: UrlOrReference): Promise<FileResource>;
    readDirectory?(url: URL): Promise<DirEntry[]>;
}

export interface FileSystemProvider extends Partial<Disposable> {
    /**
     * Get the file system for a given url. The provider is cached based upon the protocol and hostname.
     * @param url - the url to get the file system for.
     * @param next - call this function to get the next provider to try. This is useful for chaining providers that operate on the same protocol.
     */
    getFileSystem(url: URL, next: NextProvider): FileSystem | undefined;
}

class CVirtualFS implements VirtualFS {
    private readonly providers = new Set<FileSystemProvider>();
    private cachedFs = new Map<string, FileSystem | undefined>();
    private revCacheFs = new Map<FileSystemProvider, Set<string>>();
    readonly fs: Required<FileSystem>;

    constructor() {
        this.fs = fsPassThrough((url) => this.getFS(url));
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

    getFS(url: URL): FileSystem | undefined {
        const key = `${url.protocol}${url.hostname}`;

        if (this.cachedFs.has(key)) {
            return this.cachedFs.get(key);
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

        const fs = next(url);
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
                fs?.dispose?.();
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

function fsPassThrough(fs: (url: URL) => FileSystem | undefined): Required<FileSystem> {
    function gfs(ur: UrlOrReference, name: string): FileSystem {
        const url = urlOrReferenceToUrl(ur);
        const f = fs(url);
        if (!f)
            throw new VFSErrorUnhandledRequest(
                name,
                url,
                ur instanceof URL ? undefined : { url: ur.url.toString(), encoding: ur.encoding },
            );
        return f;
    }
    return {
        stat: async (url) => gfs(url, 'stat').stat(url),
        readFile: async (url) => gfs(url, 'readFile').readFile(url),
        readDirectory: async (url) => {
            const fs = gfs(url, 'readDirectory');
            return fs.readDirectory ? fs.readDirectory(url) : Promise.resolve([]);
        },
        dispose: () => undefined,
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
    const supportedProtocols = new Set(['file:', 'http:', 'https:']);
    const fs: FileSystem = {
        stat: (url) => cspellIO.getStat(url),
        readFile: (url) => cspellIO.readFile(url),
        readDirectory: (url) => cspellIO.readDirectory(url),
        dispose: () => undefined,
    };

    return {
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

export class VFSError extends Error {
    constructor(message: string, options?: { cause?: Error }) {
        super(message, options);
    }
}

export class VFSErrorUnhandledRequest extends VFSError {
    public readonly url?: string | undefined;

    constructor(
        public readonly request: string,
        url?: URL | string,
        public readonly parameters?: unknown,
    ) {
        super(`Unhandled request: ${request}`);
        this.url = url?.toString();
    }
}
