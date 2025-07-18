import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import type { FileEntryCache } from './file-entry-cache/index.js';
import * as fec from './file-entry-cache/index.js';

export type { FileDescriptor, FileEntryCache } from './file-entry-cache/index.js';

export function createFromFile(
    pathToCache: string,
    useCheckSum: boolean,
    useRelative: boolean,
): Promise<FileEntryCache> {
    const cacheFileUrl = pathToFileURL(pathToCache);
    return fec.createFromFile(
        cacheFileUrl,
        useCheckSum,
        useRelative ? fileURLToPath(new URL('./', cacheFileUrl)) : undefined,
    );
}

export function normalizePath(filePath: string): string {
    if (path.sep === '/') return filePath;
    return filePath.split(path.sep).join('/');
}
