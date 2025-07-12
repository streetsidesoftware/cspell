import type { FileEntryCache } from 'file-entry-cache';
import fileEntryCache from 'file-entry-cache';

export type { FileDescriptor, FileEntryCache } from 'file-entry-cache';

export function createFromFile(pathToCache: string, useChecksum?: boolean): FileEntryCache {
    return fileEntryCache.createFromFile(pathToCache, useChecksum);
}
