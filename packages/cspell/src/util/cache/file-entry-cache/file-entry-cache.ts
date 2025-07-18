import crypto from 'node:crypto';
import type { Stats } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

import type { FlatCache } from './flatCache.js';
import { loadCacheFile as loadFlatCache } from './flatCache.js';

export async function createFromFile(
    cacheFileUrl: URL,
    useChecksum?: boolean,
    currentWorkingDir?: string,
): Promise<FileEntryCache> {
    const cache = await loadFlatCache<Meta>(cacheFileUrl);
    const fec = new ImplFileEntryCache(cache, useChecksum ?? false, currentWorkingDir);
    await fec.removeNotFoundFiles();
    return fec;
}

class ImplFileEntryCache implements FileEntryCache {
    readonly cache: FlatCache<Meta>;
    readonly useChecksum: boolean;
    readonly #normalizedEntries: Map<string, CacheEntry> = new Map();

    /**
     * To enable relative paths as the key with current working directory
     */
    readonly currentWorkingDir: string | undefined;

    constructor(cache: FlatCache<Meta>, useChecksum?: boolean, currentWorkingDir?: string) {
        this.cache = cache;
        this.useChecksum = useChecksum || false;
        this.currentWorkingDir = currentWorkingDir;
    }

    async removeNotFoundFiles() {
        // Remove not found entries
        for (const fPath of this.cache.keys()) {
            try {
                const filePath = this.resolveKeyToFile(fPath);
                await fs.stat(filePath);
            } catch (error) {
                if (isNodeError(error) && error.code === 'ENOENT') {
                    this.cache.removeKey(fPath);
                }
            }
        }
    }

    /**
     * Given a buffer, calculate md5 hash of its content.
     * @param  buffer buffer to calculate hash on
     * @return content hash digest
     */
    #getHash(buffer: Buffer | string): string {
        return crypto.createHash('md5').update(buffer).digest('hex');
    }

    async getFileDescriptor(file: string): Promise<FileDescriptor> {
        let fstat: Stats;

        try {
            fstat = await fs.stat(file);
        } catch (error) {
            this.#removeEntry(file);
            return { key: file, notFound: true, err: toError(error) };
        }

        if (this.useChecksum) {
            return this.#getFileDescriptorUsingChecksum(file);
        }

        return this.#getFileDescriptorUsingMtimeAndSize(file, fstat);
    }

    #getFileDescriptorUsingMtimeAndSize(file: string, fstat: Stats): FileDescriptor {
        const key = this.#getFileKey(file);
        let meta = this.cache.get(key);
        const cacheExists = !!meta;

        const cSize = fstat.size;
        const cTime = fstat.mtime.getTime();

        let isDifferentDate;
        let isDifferentSize;

        if (meta) {
            isDifferentDate = cTime !== meta.mtime;
            isDifferentSize = cSize !== meta.size;
        } else {
            meta = { size: cSize, mtime: cTime };
        }

        const nEntry = {
            key,
            changed: !cacheExists || isDifferentDate || isDifferentSize,
            meta,
        };

        this.#normalizedEntries.set(key, nEntry);

        return nEntry;
    }

    async #getFileDescriptorUsingChecksum(file: string): Promise<FileDescriptor> {
        const key = this.#getFileKey(file);
        let meta = this.cache.get(key);
        const cacheExists = !!meta;

        let contentBuffer;
        try {
            contentBuffer = await fs.readFile(file);
        } catch {
            contentBuffer = '';
        }

        let isDifferent = true;
        const hash = this.#getHash(contentBuffer);

        if (meta) {
            isDifferent = hash !== meta.hash;
        } else {
            meta = { hash };
        }

        const nEntry = {
            key,
            changed: !cacheExists || isDifferent,
            meta,
        };

        this.#normalizedEntries.set(key, nEntry);

        return nEntry;
    }

    /**
     * Remove an entry from the file-entry-cache. Useful to force the file to still be considered
     * modified the next time the process is run
     */
    #removeEntry(file: string): void {
        const key = this.#getFileKey(file);
        this.#normalizedEntries.delete(key);
        this.cache.removeKey(key);
    }

    /**
     * Deletes the cache file from the disk and clears the memory cache
     */
    async destroy(): Promise<void> {
        this.#normalizedEntries.clear();
        await this.cache.destroy();
    }

    async #getMetaForFileUsingCheckSum(cacheEntry: CacheEntry): Promise<Meta> {
        const filePath = this.resolveKeyToFile(cacheEntry.key);
        const contentBuffer = await fs.readFile(filePath);
        const hash = this.#getHash(contentBuffer);
        const meta: Meta = { ...cacheEntry.meta, hash };
        delete meta.size;
        delete meta.mtime;
        return meta;
    }

    async #getMetaForFileUsingMtimeAndSize(cacheEntry: CacheEntry): Promise<Meta> {
        const filePath = this.resolveKeyToFile(cacheEntry.key);
        const stat = await fs.stat(filePath);
        const meta = { ...cacheEntry.meta, size: stat.size, mtime: stat.mtime.getTime() };
        delete meta.hash;
        return meta;
    }

    /**
     * Sync the files and persist them to the cache
     */
    async reconcile(): Promise<void> {
        await this.removeNotFoundFiles();

        for (const [entryKey, cacheEntry] of this.#normalizedEntries.entries()) {
            try {
                const meta = this.useChecksum
                    ? await this.#getMetaForFileUsingCheckSum(cacheEntry)
                    : await this.#getMetaForFileUsingMtimeAndSize(cacheEntry);
                this.cache.set(entryKey, meta);
            } catch (error) {
                // If the file does not exists we don't save it
                // other errors are just thrown
                if (!isNodeError(error) || error.code !== 'ENOENT') {
                    throw error;
                }
            }
        }

        this.cache.save();
    }

    resolveKeyToFile(entryKey: string): string {
        if (this.currentWorkingDir) {
            return path.resolve(this.currentWorkingDir, entryKey);
        }
        return entryKey;
    }

    #getFileKey(file: string): string {
        if (this.currentWorkingDir && path.isAbsolute(file)) {
            return normalizePath(path.relative(this.currentWorkingDir, file));
        }
        return normalizePath(file);
    }
}

interface NodeError extends Error {
    code?: string;
}

function isNodeError(error: unknown): error is NodeError {
    return typeof error === 'object' && error !== null && 'code' in error;
}

function toError(error: unknown): Error {
    if (error instanceof Error) {
        return error;
    }
    if (typeof error === 'string') {
        return new Error(error);
    }
    return new Error('Unknown error', { cause: error });
}

export interface AnalyzedFilesInfo {
    readonly changedFiles: string[];
    readonly notFoundFiles: string[];
    readonly notChangedFiles: string[];
}

interface UserData {
    data?: unknown;
}

interface Meta extends UserData {
    size?: number | undefined;
    mtime?: number | undefined;
    hash?: string | undefined;
}

interface CacheEntry {
    key: string;
    notFound?: boolean;
    err?: Error | undefined;
    changed?: boolean | undefined;
    meta?: Meta | undefined;
}

export type FileDescriptor = Readonly<CacheEntry>;

export interface FileEntryCache {
    getFileDescriptor(file: string): Promise<FileDescriptor>;

    /**
     * Deletes the cache file from the disk and clears the memory cache
     */
    destroy(): Promise<void>;

    /**
     * Sync the files and persist them to the cache
     */
    reconcile(): Promise<void>;
}

export function normalizePath(filePath: string): string {
    if (path.sep === '/') return filePath;
    return filePath.split(path.sep).join('/');
}
