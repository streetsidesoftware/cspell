import { mkdirSync } from 'node:fs';
import * as path from 'node:path';

import type { FileEntryCache } from './file-entry-cache/index.js';
import * as fec from './file-entry-cache/index.js';

export type { FileDescriptor, FileEntryCache } from './file-entry-cache/index.js';

export function createFromFile(
    pathToCache: string,
    useCheckSum: boolean,
    useRelative: boolean,
): Promise<FileEntryCache> {
    const absPathToCache = path.resolve(pathToCache);
    const relDir = path.dirname(absPathToCache);
    mkdirSync(relDir, { recursive: true });
    return fec.createFromFile(absPathToCache, useCheckSum, useRelative ? relDir : undefined);
}

export function normalizePath(filePath: string): string {
    if (path.sep === '/') return filePath;
    return filePath.split(path.sep).join('/');
}
