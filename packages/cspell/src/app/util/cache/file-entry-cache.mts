import type { FileEntryCache } from 'file-entry-cache';
import fileEntryCache from 'file-entry-cache';

export type { FileDescriptor, FileEntryCache } from 'file-entry-cache';

export interface FileEntryCacheOptions {
    useCheckSum?: boolean;
    currentWorkingDirectory?: string;
}

export function createFromFile(pathToCache: string, options: FileEntryCacheOptions): FileEntryCache {
    return fileEntryCache.createFromFile(pathToCache, options.useCheckSum, options.currentWorkingDirectory);
}
