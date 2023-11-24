import type { Dirent } from 'node:fs';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

import { findUp } from 'find-up';
import { pathToFileURL } from 'url';

import { createAutoResolveCache } from '../../../util/AutoResolve.js';
import { addTrailingSlash, fileURLOrPathToPath, toFileDirUrl, toURL } from '../../../util/url.js';

export class ConfigSearch {
    private searchCache = new Map<string, Promise<URL | undefined>>();
    private searchDirCache = new Map<string, Promise<string | undefined>>();

    constructor(readonly searchPlaces: readonly string[]) {
        this.searchPlaces = searchPlaces;
    }

    async searchForConfig(searchFrom: URL | string): Promise<URL | undefined> {
        if (typeof searchFrom === 'string') {
            if (!searchFrom.startsWith('file:')) {
                return undefined;
            }
        } else {
            if (searchFrom.protocol !== 'file:') {
                return undefined;
            }
        }

        const searchFromURL = toURL(searchFrom);
        let dirUrl = new URL('.', searchFrom);
        if (dirUrl.toString() !== searchFrom.toString()) {
            // check to see if searchFrom is a directory
            const isDir = await isDirectory(searchFrom);
            dirUrl = isDir ? addTrailingSlash(searchFromURL) : dirUrl;
        }
        const searchHref = dirUrl.href;
        const searchCache = this.searchCache;
        const cached = searchCache.get(searchHref);
        if (cached) {
            return cached;
        }

        const toPatchCache: string[] = [];

        const foundPath = await this.findUpConfigPath(fileURLOrPathToPath(dirUrl), storeVisit);
        const foundUrl = foundPath ? pathToFileURL(foundPath) : undefined;

        const pFoundPath = Promise.resolve(foundPath);
        const pFoundUrl = Promise.resolve(foundUrl);

        const searchDirCache = this.searchDirCache;
        for (const dir of toPatchCache) {
            searchDirCache.set(dir, searchDirCache.get(dir) || pFoundPath);
            const dirHref = toFileDirUrl(dir).href;
            searchCache.set(dirHref, searchCache.get(dirHref) || pFoundUrl);
        }

        const result = searchCache.get(searchHref) || pFoundUrl;

        searchCache.set(searchHref, result);

        return result;

        function storeVisit(dir: string) {
            toPatchCache.push(dir);
        }
    }

    clearCache() {
        this.searchCache.clear();
    }

    private async findUpConfig(searchFromPath: URL, visit: (dir: string) => void): Promise<URL | undefined> {
        const cwd = fileURLOrPathToPath(searchFromPath);
        const found = await this.findUpConfigPath(cwd, visit);
        return found ? pathToFileURL(found) : undefined;
    }

    private findUpConfigPath(cwd: string, visit: (dir: string) => void): Promise<string | undefined> {
        const searchDirCache = this.searchDirCache;
        const cached = searchDirCache.get(cwd);
        if (cached) return cached;

        return findUp((dir) => this.hasConfig(dir, visit), { cwd, type: 'file' });
    }

    private async hasConfig(dir: string, visited: (dir: string) => void): Promise<string | undefined> {
        dir = path.normalize(dir + '/');
        const cached = this.searchDirCache.get(dir);
        if (cached) return cached;
        visited(dir);

        const dirInfoCache = createAutoResolveCache<string, Promise<Map<string, Dirent>>>();

        async function hasFile(filename: string): Promise<boolean> {
            const dirInfo = await dirInfoCache.get(
                path.dirname(filename),
                async (dir) =>
                    new Map(
                        (await readdir(dir, { withFileTypes: true }).catch(() => [])).map((ent) => [ent.name, ent]),
                    ),
            );

            const name = path.basename(filename);
            const found = dirInfo.get(name);
            return !!found?.isFile();
        }

        for (const searchPlace of this.searchPlaces) {
            const file = path.join(dir, searchPlace);
            const found = await hasFile(file);
            if (found) {
                if (path.basename(file) !== 'package.json') return file;
                const content = await readFile(file, 'utf8');
                const pkg = JSON.parse(content);
                if (typeof pkg.cspell === 'object') return file;
            }
        }
        return undefined;
    }
}

async function isDirectory(path: string | URL): Promise<boolean> {
    try {
        return (await stat(path)).isDirectory();
    } catch (e) {
        return false;
    }
}
