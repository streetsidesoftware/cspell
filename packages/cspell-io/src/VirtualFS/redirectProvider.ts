import assert from 'assert';

import { renameFileReference, renameFileResource, urlOrReferenceToUrl } from '../common/index.js';
import type { DirEntry, FileReference, FileResource } from '../models/index.js';
import type { FileSystemProvider, ProviderFileSystem } from '../VirtualFS.js';
import { fsCapabilities, VFSErrorUnsupportedRequest } from '../VirtualFS.js';

type UrlOrReference = URL | FileReference;

class RedirectProvider implements FileSystemProvider {
    constructor(
        readonly name: string,
        readonly publicRoot: URL,
        readonly privateRoot: URL,
    ) {}

    getFileSystem(url: URL, next: (url: URL) => ProviderFileSystem | undefined): ProviderFileSystem | undefined {
        if (url.protocol !== this.publicRoot.protocol || url.host !== this.publicRoot.host) {
            return undefined;
        }

        const privateFs = next(this.privateRoot);
        if (!privateFs) {
            return undefined;
        }

        const shadowFS = next(url);

        return remapFS(this.name, privateFs, shadowFS, this.publicRoot, this.privateRoot);
    }
}

/**
 * Create a provider that will redirect requests from the publicRoot to the privateRoot.
 * This is useful for creating a virtual file system that is a subset of another file system.
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
 * @returns FileSystemProvider
 */
export function createRedirectProvider(name: string, publicRoot: URL, privateRoot: URL): FileSystemProvider {
    assert(publicRoot.pathname.endsWith('/'), 'publicRoot must end with a slash');
    assert(privateRoot.pathname.endsWith('/'), 'privateRoot must end with a slash');
    return new RedirectProvider(name, publicRoot, privateRoot);
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
    fs: ProviderFileSystem,
    shadowFs: ProviderFileSystem | undefined,
    publicRoot: URL,
    privateRoot: URL,
): ProviderFileSystem {
    function mapToPrivate(url: URL): URL {
        const relativePath = url.pathname.slice(publicRoot.pathname.length);
        return new URL(relativePath, privateRoot);
    }

    function mapToPublic(url: URL): URL {
        const relativePath = url.pathname.slice(privateRoot.pathname.length);
        return new URL(relativePath, publicRoot);
    }

    const mapFileReferenceToPrivate = (ref: FileReference): FileReference => {
        return renameFileReference(ref, mapToPrivate(ref.url));
    };

    const mapFileReferenceToPublic = (ref: FileReference): FileReference => {
        return renameFileReference(ref, mapToPublic(ref.url));
    };

    const mapUrlOrReferenceToPrivate = (urlOrRef: URL | FileReference): URL | FileReference => {
        return urlOrRef instanceof URL ? mapToPrivate(urlOrRef) : mapFileReferenceToPrivate(urlOrRef);
    };

    const mapFileResourceToPublic = (res: FileResource): FileResource => {
        return renameFileResource(res, mapToPublic(res.url));
    };

    const mapFileResourceToPrivate = (res: FileResource): FileResource => {
        return renameFileResource(res, mapToPrivate(res.url));
    };

    const mapDirEntryToPublic = (de: DirEntry): DirEntry => {
        const dir = mapToPublic(de.dir);
        return { ...de, dir };
    };

    const fs2: ProviderFileSystem = {
        stat: async (url) => {
            const url2 = mapUrlOrReferenceToPrivate(url);
            const stat = await fs.stat(url2);
            return stat;
        },

        readFile: async (url) => {
            const url2 = mapUrlOrReferenceToPrivate(url);
            const file = await fs.readFile(url2);
            return mapFileResourceToPublic(file);
        },

        readDirectory: async (url) => {
            const url2 = mapToPrivate(url);
            const dir = await fs.readDirectory(url2);
            return dir.map(mapDirEntryToPublic);
        },
        writeFile: async (file) => {
            const fileRef2 = mapFileResourceToPrivate(file);
            const fileRef3 = await fs.writeFile(fileRef2);
            return mapFileReferenceToPublic(fileRef3);
        },
        providerInfo: { ...fs.providerInfo, name },
        capabilities: fs.capabilities,
        dispose: () => fs.dispose(),
    };

    return fsPassThrough(fs2, shadowFs, publicRoot);
}

function fsPassThrough(
    fs: ProviderFileSystem,
    shadowFs: ProviderFileSystem | undefined,
    root: URL,
): ProviderFileSystem {
    function gfs(ur: UrlOrReference, name: string): ProviderFileSystem {
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
    const passThroughFs: ProviderFileSystem = {
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
    };
    return passThroughFs;
}
