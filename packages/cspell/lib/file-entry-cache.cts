export type { FileDescriptor, FileEntryCache } from 'file-entry-cache';
import * as file_entry_cache from 'file-entry-cache';

export function createFromFile(pathToCache: string, useChecksum?: boolean): file_entry_cache.FileEntryCache {
    return file_entry_cache.createFromFile(pathToCache, useChecksum);
}
