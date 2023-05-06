export type { FileDescriptor, FileEntryCache } from 'file-entry-cache';
import type { FileEntryCache } from 'file-entry-cache';
/* This is to work around a bug in file-entry-cache that uses `this` */
import * as fileEntryCache from 'file-entry-cache';

export function createFromFile(pathToCache: string, useChecksum?: boolean): FileEntryCache {
    return fileEntryCache.createFromFile(pathToCache, useChecksum);
}
