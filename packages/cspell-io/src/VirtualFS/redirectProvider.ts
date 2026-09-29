import assert from 'node:assert';

import { renameFileReference, renameFileResource, urlOrReferenceToUrl } from '../common/index.js';
import type { DirEntry, FileReference, FileResource } from '../models/index.js';
import { fsCapabilities } from './capabilities.js';
import { VFSErrorUnsupportedRequest } from './errors.js';
import type { FSCapabilityFlags } from './VFileSystem.js';
import type { VFileSystemProvider, VProviderFileSystem, VProviderFileSystemReadFileOptions } from './VirtualFS.js';

type UrlOrReference = URL | FileReference;

export interface RedirectOptions {
    /**
     * Option ts to mask the capabilities of the provider.
     * @default: -1
     */
    capabilitiesMask?: number;
    capabilities?: FSCapabilityFlags;
}

class RedirectProvider implements VFileSystemProvider {
    constructor(
        readonly name: string,
        readonly publicRoot: URL,
        readonly privateRoot: URL,
        readonly options: RedirectOptions = { capabilitiesMask: -1 },
    ) {}

    getFileSystem(url: URL, next: (url: URL) => VProviderFileSystem | undefined): VProviderFileSystem | undefined {
        if (url.protocol !== this.publicRoot.protocol || url.host !== this.publicRoot.host) {
            return undefined;
        }

        const privateFs = next(this.privateRoot);
        if (!privateFs) {
            return undefined;
        }

        const shadowFS = next(url);

        return remapFS(this.name, privateFs, shadowFS, this.publicRoot, this.privateRoot, this.options);
    }
}

/**
 * Create a provider that will redirect requests from the publicRoot to the privateRoot.
 * This is useful for creating a virtual file system that is a subset of another file system.
 *
 * A request under the publicRoot is only passed on if it maps to a URL under the privateRoot.
 * Other requests are rejected with a `VFSErrorUnsupportedRequest`.
 *
 * Example:
 * ```ts
 * const vfs = createVirtualFS();
 * const provider = createRedirectProvider('test', new URL('file:///public/'), new URL('file:///private/'))
 * vfs.registerFileSystemProvider(provider);
 * // Read the content of `file:///private/file.txt`
 * const file = vfs.fs.readFile(new URL('file:///public/file.txt');
 * ```
 *
 * @param name - name of the provider
 * @param publicRoot - the root of the public file system.
 * @param privateRoot - the root of the private file system.
 * @param options - options for the provider.
 * @returns FileSystemProvider
 */
export function createRedirectProvider(
    name: string,
    publicRoot: URL,
    privateRoot: URL,
    options?: RedirectOptions,
): VFileSystemProvider {
    assert(publicRoot.pathname.endsWith('/'), 'publicRoot must end with a slash');
    assert(privateRoot.pathname.endsWith('/'), 'privateRoot must end with a slash');
    return new RedirectProvider(name, publicRoot, privateRoot, options);
}

/**
 * Create a Remapped file system that will redirect requests from the publicRoot to the privateRoot.
 * Requests that do not match the publicRoot will be passed to the shadowFs.
 * @param name - name of the provider
 * @param fs - the private file system
 * @param shadowFs - the file system that is obscured by the redirect.
 * @param publicRoot - the root of the public file system.
 * @param privateRoot - the root of the private file system.
 * @returns ProviderFileSystem
 */
function remapFS(
    name: string,
    fs: VProviderFileSystem,
    shadowFs: VProviderFileSystem | undefined,
    publicRoot: URL,
    privateRoot: URL,
    options: RedirectOptions,
): VProviderFileSystem {
    const { capabilitiesMask = -1, capabilities } = options;
    const mapToPrivate = (url: URL, request: string): URL => mapUrl(url, publicRoot, privateRoot, request);
    const mapToPublic = (url: URL, request: string): URL => mapUrl(url, privateRoot, publicRoot, request);

    const mapFileReferenceToPrivate = (ref: FileReference, request: string): FileReference => {
        return renameFileReference(ref, mapToPrivate(ref.url, request));
    };

    const mapFileReferenceToPublic = (ref: FileReference, request: string): FileReference => {
        return renameFileReference(ref, mapToPublic(ref.url, request));
    };

    const mapUrlOrReferenceToPrivate = (urlOrRef: URL | FileReference, request: string): URL | FileReference => {
        return urlOrRef instanceof URL ? mapToPrivate(urlOrRef, request) : mapFileReferenceToPrivate(urlOrRef, request);
    };

    const mapFileResourceToPublic = (res: FileResource, request: string): FileResource => {
        return renameFileResource(res, mapToPublic(res.url, request));
    };

    const mapFileResourceToPrivate = (res: FileResource, request: string): FileResource => {
        return renameFileResource(res, mapToPrivate(res.url, request));
    };

    const mapDirEntryToPublic = (de: DirEntry, request: string): DirEntry => {
        const dir = mapToPublic(de.dir, request);
        return { ...de, dir };
    };

    const dispose = () => fs.dispose();

    const fs2: VProviderFileSystem = {
        stat: async (url) => {
            const url2 = mapUrlOrReferenceToPrivate(url, 'stat');
            const stat = await fs.stat(url2);
            return stat;
        },

        readFile: async (url, options?: VProviderFileSystemReadFileOptions) => {
            const url2 = mapUrlOrReferenceToPrivate(url, 'readFile');
            const file = await fs.readFile(url2, options);
            return mapFileResourceToPublic(file, 'readFile');
        },

        readDirectory: async (url) => {
            const url2 = mapToPrivate(url, 'readDirectory');
            const dir = await fs.readDirectory(url2);
            return dir.map((de) => mapDirEntryToPublic(de, 'readDirectory'));
        },
        writeFile: async (file) => {
            const fileRef2 = mapFileResourceToPrivate(file, 'writeFile');
            const fileRef3 = await fs.writeFile(fileRef2);
            return mapFileReferenceToPublic(fileRef3, 'writeFile');
        },
        providerInfo: { ...fs.providerInfo, name },
        capabilities: capabilities ?? fs.capabilities & capabilitiesMask,
        dispose,
        [Symbol.dispose]: dispose,
    };

    return fsPassThrough(fs2, shadowFs, publicRoot);
}

/**
 * Map a URL under `fromRoot` to the same relative path under `toRoot`.
 * Throws if the URL is not under `fromRoot` or the result is not under `toRoot`.
 */
function mapUrl(url: URL, fromRoot: URL, toRoot: URL, request: string): URL {
    const unsupported = () => new VFSErrorUnsupportedRequest(request, url);

    if (!isUrlUnderRoot(url, fromRoot)) throw unsupported();

    const relativePath = url.pathname.slice(fromRoot.pathname.length);
    // A leading separator would make the path absolute, dropping the root.
    if (/^(?:[/\\]|%2f|%5c)/i.test(relativePath)) throw unsupported();

    // `./` keeps a segment like `c:` or `http:` from being read as a scheme.
    const mapped = new URL('./' + relativePath, toRoot);
    if (!isUrlUnderRoot(mapped, toRoot)) throw unsupported();

    return mapped;
}

function isUrlUnderRoot(url: URL, root: URL): boolean {
    return url.protocol === root.protocol && url.host === root.host && url.pathname.startsWith(root.pathname);
}

function fsPassThrough(
    fs: VProviderFileSystem,
    shadowFs: VProviderFileSystem | undefined,
    root: URL,
): VProviderFileSystem {
    function gfs(ur: UrlOrReference, name: string): VProviderFileSystem {
        const url = urlOrReferenceToUrl(ur);
        const f = url.href.startsWith(root.href) ? fs : shadowFs;
        if (!f)
            throw new VFSErrorUnsupportedRequest(
                name,
                url,
                ur instanceof URL ? undefined : { url: ur.url.toString(), encoding: ur.encoding },
            );
        return f;
    }
    const passThroughFs: VProviderFileSystem = {
        get providerInfo() {
            return fs.providerInfo;
        },
        get capabilities() {
            return fs.capabilities;
        },
        stat: async (url) => gfs(url, 'stat').stat(url),
        readFile: async (url) => gfs(url, 'readFile').readFile(url),
        writeFile: async (file) => gfs(file, 'writeFile').writeFile(file),
        readDirectory: async (url) => gfs(url, 'readDirectory').readDirectory(url),
        getCapabilities(url: URL) {
            const f = gfs(url, 'getCapabilities');
            return f.getCapabilities ? f.getCapabilities(url) : fsCapabilities(f.capabilities);
        },
        dispose: () => {
            fs.dispose();
            shadowFs?.dispose();
        },
        [Symbol.dispose]() {
            this.dispose();
        },
    };
    return passThroughFs;
}
