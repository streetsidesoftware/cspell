import type { FileEntryCache } from './file-entry-cache/index.js';
import * as fec from './file-entry-cache/index.js';

export type { FileDescriptor, FileEntryCache } from './file-entry-cache/index.js';

export function createFromFile(cacheFileUrl: URL, useCheckSum: boolean, useRelative: boolean): Promise<FileEntryCache> {
    return fec.createFromFile(cacheFileUrl, useCheckSum, useRelative ? new URL('./', cacheFileUrl) : undefined);
}
