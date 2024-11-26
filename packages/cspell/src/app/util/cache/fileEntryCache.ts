/**
 * This is a wrapper for 'file-entry-cache'
 */

export type { FileDescriptor } from './file-entry-cache.mjs';
import { mkdirSync } from 'node:fs';
import * as path from 'node:path';

import type { FileEntryCache as FecFileEntryCache } from './file-entry-cache.mjs';
import { createFromFile as fecCreateFromFile } from './file-entry-cache.mjs';

export type FileEntryCache = Pick<FecFileEntryCache, 'reconcile' | 'destroy' | 'getFileDescriptor'>;

export function createFromFile(pathToCache: string, useCheckSum: boolean, useRelative: boolean): FileEntryCache {
    const absPathToCache = path.resolve(pathToCache);
    const relDir = path.dirname(absPathToCache);
    mkdirSync(relDir, { recursive: true });
    const feCache = fecCreateFromFile(absPathToCache, { useCheckSum, currentWorkingDirectory: relDir });
    const cacheWrapper: FileEntryCache = {
        getFileDescriptor: (file: string) => {
            const r = resolveFile(process.cwd(), file);
            const d = feCache.getFileDescriptor(r, { useCheckSum, currentWorkingDirectory: relDir });
            // if (d.changed) {
            //     console.log(`File changed: ${r} %o`, d);
            // }
            return d;
        },
        destroy(): void {
            feCache.destroy();
        },
        reconcile: () => {
            feCache.reconcile();
        },
    };

    return cacheWrapper;

    function resolveFile(cwd: string, file: string): string {
        if (!useRelative) return normalizePath(file);
        const r = path.relative(relDir, path.resolve(cwd, file));
        return normalizePath(r);
    }
}

export function normalizePath(filePath: string): string {
    if (path.sep === '/') return filePath;
    return filePath.split(path.sep).join('/');
}
