import { urlBasename } from 'cspell-io';

import type { VFileSystem, VfsDirEntry } from '../../../fileSystem.js';
import { createAutoResolveCache } from '../../../util/AutoResolve.js';
import { findUpFromUrl } from '../../../util/findUpFromUrl.js';

type Href = string;

export class ConfigSearch {
    private searchCache = new Map<Href, Promise<URL | undefined>>();
    private searchDirCache = new Map<Href, Promise<URL | undefined>>();

    constructor(
        readonly searchPlaces: readonly string[],
        private fs: VFileSystem,
    ) {
        this.searchPlaces = searchPlaces;
    }

    searchForConfig(searchFromURL: URL): Promise<URL | undefined> {
        const dirUrl = new URL('.', searchFromURL);
        const searchHref = dirUrl.href;
        const searchCache = this.searchCache;
        const cached = searchCache.get(searchHref);
        if (cached) {
            return cached;
        }

        const toPatchCache: URL[] = [];
        const pFoundUrl = this.findUpConfigPath(dirUrl, storeVisit);
        this.searchCache.set(searchHref, pFoundUrl);
        const searchDirCache = this.searchDirCache;

        const patch = async () => {
            try {
                await pFoundUrl;
                for (const dir of toPatchCache) {
                    searchDirCache.set(dir.href, searchDirCache.get(dir.href) || pFoundUrl);
                    searchCache.set(dir.href, searchCache.get(dir.href) || pFoundUrl);
                }

                const result = searchCache.get(searchHref) || pFoundUrl;
                searchCache.set(searchHref, result);
            } catch (e) {
                // ignore
            }
        };

        patch();
        return pFoundUrl;

        function storeVisit(dir: URL) {
            toPatchCache.push(dir);
        }
    }

    clearCache() {
        this.searchCache.clear();
        this.searchDirCache.clear();
    }

    private findUpConfigPath(cwd: URL, visit: (dir: URL) => void): Promise<URL | undefined> {
        const searchDirCache = this.searchDirCache;
        const cached = searchDirCache.get(cwd.href);
        if (cached) return cached;

        return findUpFromUrl((dir) => this.hasConfig(dir, visit), cwd, { type: 'file' });
    }

    private hasConfig(dir: URL, visited: (dir: URL) => void): Promise<URL | undefined> {
        const cached = this.searchDirCache.get(dir.href);
        if (cached) return cached;
        visited(dir);

        const result = this.hasConfigDir(dir);
        this.searchDirCache.set(dir.href, result);
        return result;
    }

    private createHasFileDirSearch(): (file: URL) => Promise<boolean> {
        const dirInfoCache = createAutoResolveCache<Href, Promise<Map<string, VfsDirEntry>>>();

        const hasFile = async (filename: URL): Promise<boolean> => {
            const dir = new URL('.', filename);
            const parent = new URL('..', dir);
            const parentHref = parent.href;
            const parentInfoP = dirInfoCache.get(parentHref);
            if (parentInfoP) {
                const parentInfo = await parentInfoP;
                const name = urlBasename(dir).slice(0, -1);
                const found = parentInfo.get(name);
                if (!found?.isDirectory() && !found?.isSymbolicLink()) return false;
            }
            const dirUrlHref = dir.href;
            const dirInfo = await dirInfoCache.get(dirUrlHref, async () => await this.readDir(dir));

            const name = urlBasename(filename);
            const found = dirInfo.get(name);
            return found?.isFile() || found?.isSymbolicLink() || false;
        };

        return hasFile;
    }

    private async readDir(dir: URL): Promise<Map<string, VfsDirEntry>> {
        try {
            const dirInfo = await this.fs.readDirectory(dir);
            return new Map(dirInfo.map((ent) => [ent.name, ent]));
        } catch (e) {
            return new Map();
        }
    }

    private createHasFileStatCheck(): (file: URL) => Promise<boolean> {
        const hasFile = async (filename: URL): Promise<boolean> => {
            const stat = await this.fs.stat(filename).catch(() => undefined);
            return !!stat?.isFile();
        };

        return hasFile;
    }

    private async hasConfigDir(dir: URL): Promise<URL | undefined> {
        const hasFile = this.fs.getCapabilities(dir).readDirectory
            ? this.createHasFileDirSearch()
            : this.createHasFileStatCheck();

        for (const searchPlace of this.searchPlaces) {
            const file = new URL(searchPlace, dir);
            const found = await hasFile(file);
            if (found) {
                if (urlBasename(file) !== 'package.json') return file;
                if (await checkPackageJson(this.fs, file)) return file;
            }
        }
        return undefined;
    }
}

async function checkPackageJson(fs: VFileSystem, filename: URL): Promise<boolean> {
    try {
        const file = await fs.readFile(filename);
        const pkg = JSON.parse(file.getText());
        return typeof pkg.cspell === 'object';
    } catch (e) {
        return false;
    }
}
