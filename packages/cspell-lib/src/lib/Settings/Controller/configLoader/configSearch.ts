import { extname } from 'node:path/posix';

import { urlBasename } from 'cspell-io';

import type { VFileSystem, VfsDirEntry } from '../../../fileSystem.js';
import { createAutoResolveCache } from '../../../util/AutoResolve.js';
import { findUpFromUrl } from '../../../util/findUpFromUrl.js';

type Href = string;

export class ConfigSearch {
    /**
     * Cache of search results.
     */
    #searchCache = new Map<Href, Promise<URL | undefined>>();
    /**
     * The scanner to use to search for config files.
     */
    #scanner: DirConfigScanner;

    /**
     * @param searchPlaces - The list of file names to search for.
     * @param allowedExtensionsByProtocol - Map of allowed extensions by protocol, '*' is used to match all protocols.
     * @param fs - The file system to use.
     */
    constructor(
        searchPlaces: readonly string[],
        allowedExtensionsByProtocol: Map<string, readonly string[]>,
        fs: VFileSystem,
    ) {
        this.#scanner = new DirConfigScanner(searchPlaces, allowedExtensionsByProtocol, fs);
    }

    async searchForConfig(searchFromURL: URL, stopSearchAtURL?: URL[]): Promise<URL | undefined> {
        const dirUrl = searchFromURL.pathname.endsWith('/')
            ? searchFromURL
            : new URL('./', searchFromURL);

        const stopDirUrls = stopSearchAtURL
            ? stopSearchAtURL.map(url =>
                url.pathname.endsWith('/')
                    ? url
                    : new URL('./', url)
            )
            : undefined;

        return this.#findUp(dirUrl, stopDirUrls);
    }

    clearCache() {
        this.#searchCache.clear();
        this.#scanner.clearCache();
    }

    #findUp(fromDir: URL, stopDirUrls?: URL[]): Promise<URL | undefined> {
        const searchDirCache = this.#searchCache;
        const cached = searchDirCache.get(fromDir.href);
        if (cached) {
            return cached;
        }
        const visited: URL[] = [];
        let result: Promise<URL | undefined> | undefined = undefined;
        const predicate = (dir: URL) => {
            visit(dir);
            return this.#scanner.scanDirForConfigFile(dir);
        };
        result = findUpFromUrl(predicate, fromDir, { type: 'file', ...(stopDirUrls && { stopAt: stopDirUrls }) });
        searchDirCache.set(fromDir.href, result);
        visited.forEach((dir) => searchDirCache.set(dir.href, result));
        return result;

        /**
         * Record directories that are visited while walking up the directory tree.
         * This will help speed up future searches.
         * @param dir - the directory that was visited.
         */
        function visit(dir: URL) {
            if (!result) {
                visited.push(dir);
                return;
            }
            searchDirCache.set(dir.href, searchDirCache.get(dir.href) || result);
        }
    }
}

/**
 * A Scanner that searches for a config file in a directory. It caches the results to speed up future requests.
 */
export class DirConfigScanner {
    #searchDirCache = new Map<Href, Promise<URL | undefined>>();
    #searchPlacesByProtocol: Map<string, string[]>;
    #searchPlaces: readonly string[];

    /**
     * @param searchPlaces - The list of file names to search for.
     * @param allowedExtensionsByProtocol - Map of allowed extensions by protocol, '*' is used to match all protocols.
     * @param fs - The file system to use.
     */
    constructor(
        searchPlaces: readonly string[],
        readonly allowedExtensionsByProtocol: Map<string, readonly string[]>,
        private fs: VFileSystem,
    ) {
        this.#searchPlacesByProtocol = setupSearchPlacesByProtocol(searchPlaces, allowedExtensionsByProtocol);
        this.#searchPlaces = this.#searchPlacesByProtocol.get('*') || searchPlaces;
    }

    clearCache() {
        this.#searchDirCache.clear();
    }

    /**
     *
     * @param dir - the directory to search for a config file.
     * @param visited - a callback to be called for each directory visited.
     * @returns A promise that resolves to the url of the config file or `undefined`.
     */
    scanDirForConfigFile(dir: URL): Promise<URL | undefined> {
        const searchDirCache = this.#searchDirCache;
        const href = dir.href;
        const cached = searchDirCache.get(href);
        if (cached) {
            return cached;
        }
        const result = this.#scanDirForConfig(dir);
        searchDirCache.set(href, result);
        return result;
    }

    #createHasFileDirSearch(): (file: URL) => Promise<boolean> {
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
            const dirInfo = await dirInfoCache.get(dirUrlHref, async () => await this.#readDir(dir));

            const name = urlBasename(filename);
            const found = dirInfo.get(name);
            return found?.isFile() || found?.isSymbolicLink() || false;
        };

        return hasFile;
    }

    async #readDir(dir: URL): Promise<Map<string, VfsDirEntry>> {
        try {
            const dirInfo = await this.fs.readDirectory(dir);
            return new Map(dirInfo.map((ent) => [ent.name, ent]));
        } catch {
            return new Map();
        }
    }

    #createHasFileStatCheck(): (file: URL) => Promise<boolean> {
        const hasFile = async (filename: URL): Promise<boolean> => {
            const stat = await this.fs.stat(filename).catch(() => undefined);
            return !!stat?.isFile();
        };

        return hasFile;
    }

    /**
     * Scan the directory for the first matching config file.
     * @param dir - url of the directory to scan.
     * @returns A promise that resolves to the url of the config file or `undefined`.
     */
    async #scanDirForConfig(dir: URL): Promise<URL | undefined> {
        const hasFile = this.fs.getCapabilities(dir).readDirectory
            ? this.#createHasFileDirSearch()
            : this.#createHasFileStatCheck();

        const searchPlaces = this.#searchPlacesByProtocol.get(dir.protocol) || this.#searchPlaces;

        for (const searchPlace of searchPlaces) {
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

function setupSearchPlacesByProtocol(
    searchPlaces: readonly string[],
    allowedExtensionsByProtocol: Map<string, readonly string[]>,
): Map<string, string[]> {
    const map = new Map(
        [...allowedExtensionsByProtocol.entries()]
            .map(([k, v]) => [k, new Set(v)] as const)
            .map(([protocol, exts]) => [protocol, searchPlaces.filter((url) => exts.has(extname(url)))] as const),
    );
    return map;
}

async function checkPackageJson(fs: VFileSystem, filename: URL): Promise<boolean> {
    try {
        const file = await fs.readFile(filename);
        const pkg = JSON.parse(file.getText());
        return typeof pkg.cspell === 'object';
    } catch {
        return false;
    }
}
