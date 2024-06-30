import type { VFileSystem } from '../fileSystem.js';
import { getVirtualFS } from '../fileSystem.js';

type EntryType = 'file' | 'directory' | '!file' | '!directory';

export type FindUpFileSystem = Pick<VFileSystem, 'findUp'>;

export interface FindUpURLOptions {
    type?: EntryType;
    stopAt?: URL;
    fs?: FindUpFileSystem;
}

type FindUpPredicate = (dir: URL) => URL | undefined | Promise<URL | undefined>;

export async function findUpFromUrl(
    name: string | string[] | FindUpPredicate,
    from: URL,
    options: FindUpURLOptions = {},
): Promise<URL | undefined> {
    const fs = options.fs ?? getVirtualFS().fs;
    return fs.findUp(name, from, options);
}
