/**
 * This is a wrapper for 'file-entry-cache'
 */

export type { FileDescriptor } from './file-entry-cache.mjs';
import { mkdirSync } from 'node:fs';
import * as path from 'node:path';

import type { FileEntryCache as FecFileEntryCache } from './file-entry-cache.mjs';
import * as fec from './file-entry-cache.mjs';

export type FileEntryCache = FecFileEntryCache;

export function createFromFile(pathToCache: string, useCheckSum: boolean, useRelative: boolean): FileEntryCache {
    const absPathToCache = path.resolve(pathToCache);
    const relDir = path.dirname(absPathToCache);
    mkdirSync(relDir, { recursive: true });
    return fec.createFromFile(absPathToCache, useCheckSum, useRelative ? relDir : undefined);
}

export function normalizePath(filePath: string): string {
    if (path.sep === '/') return filePath;
    return filePath.split(path.sep).join('/');
}
