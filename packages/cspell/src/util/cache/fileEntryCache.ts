/**
 * This is a wrapper for 'file-entry-cache'
 */

export type { FileDescriptor, FileEntryCache } from 'file-entry-cache';
import type { FileEntryCache } from 'file-entry-cache';
import * as file_entry_cache from 'file-entry-cache';
import * as path from 'path';
import * as fs from 'fs-extra';

export function createFromFile(pathToCache: string, useCheckSum?: boolean): FileEntryCache {
    const absPathToCache = path.resolve(pathToCache);
    const relDir = path.dirname(absPathToCache);
    fs.mkdirpSync(relDir);
    const create = wrap(() => file_entry_cache.createFromFile(absPathToCache, useCheckSum));
    const feCache = create();
    const cacheWrapper: FileEntryCache = {
        get cache() {
            return feCache.cache;
        },
        getHash(buffer: Buffer): string {
            return feCache.getHash(buffer);
        },
        hasFileChanged: wrap((cwd, file: string) => {
            console.log(file);
            return feCache.hasFileChanged(resolveFile(cwd, file));
        }),
        analyzeFiles: wrap((cwd, files?: string[]) => {
            return feCache.analyzeFiles(resolveFiles(cwd, files));
        }),

        getFileDescriptor: wrap((cwd, file: string) => {
            console.log(file);
            return feCache.getFileDescriptor(resolveFile(cwd, file));
        }),
        getUpdatedFiles: wrap((cwd, files?: string[]) => {
            return feCache.getUpdatedFiles(resolveFiles(cwd, files));
        }),
        normalizeEntries: wrap((cwd, files?: string[]) => {
            return feCache.normalizeEntries(resolveFiles(cwd, files));
        }),
        removeEntry: wrap((cwd, file: string) => {
            console.log(file);
            return feCache.removeEntry(resolveFile(cwd, file));
        }),
        deleteCacheFile(): void {
            feCache.deleteCacheFile();
        },
        destroy(): void {
            feCache.destroy();
        },
        reconcile: wrap((_cwd, noPrune?: boolean) => {
            feCache.reconcile(noPrune);
        }),
    };

    return cacheWrapper;

    function resolveFile(cwd: string, file: string): string {
        return path.relative(relDir, path.resolve(cwd, file));
    }

    function resolveFiles(cwd: string, files: string[] | undefined): string[] | undefined {
        return files?.map((file) => resolveFile(cwd, file));
    }

    function wrap<P extends unknown[], T>(fn: (cwd: string, ...params: P) => T): (...params: P) => T {
        return (...params: P) => {
            const cwd = process.cwd();
            try {
                process.chdir(relDir);
                return fn(cwd, ...params);
            } finally {
                process.chdir(cwd);
            }
        };
    }
}
