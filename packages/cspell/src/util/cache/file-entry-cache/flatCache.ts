import fs from 'node:fs/promises';

import { parse, stringify } from 'flatted';

export class FlatCache<T> {
    #cache: Map<string, T>;

    constructor(readonly cacheFilename: URL) {
        this.#cache = new Map<string, T>();
    }

    keys(): MapIterator<string> {
        return this.#cache.keys();
    }

    set(key: string, value: T): this {
        this.#cache.set(key, value);
        return this;
    }

    removeKey(key: string): void {
        this.#cache.delete(key);
    }

    get(key: string): T | undefined {
        return this.#cache.get(key);
    }

    async load(ifFound: boolean = true): Promise<this> {
        this.#cache.clear();
        try {
            const content = await fs.readFile(this.cacheFilename, 'utf8');
            this.#cache = new Map<string, T>(Object.entries(parse(content)));
        } catch (error) {
            if (!ifFound) {
                throw error;
            }
        }
        return this;
    }

    async save(): Promise<void> {
        const dir = new URL('.', this.cacheFilename);
        await fs.mkdir(dir, { recursive: true });
        const content = stringify(Object.fromEntries(this.#cache.entries()));
        await fs.writeFile(this.cacheFilename, content, 'utf8');
    }

    /**
     * Clear the cache and remove the cache file from disk.
     */
    async destroy(): Promise<void> {
        this.#cache.clear();
        try {
            await fs.unlink(this.cacheFilename);
        } catch {
            // Ignore errors when deleting the cache file.
            // It may not exist or may not be writable.
        }
    }
}

/**
 *
 * @param cachefile - The location of the cache file.
 * @returns
 */
export function loadCacheFile<T>(cachefile: URL): Promise<FlatCache<T>> {
    const cache = new FlatCache<T>(cachefile);
    return cache.load();
}
