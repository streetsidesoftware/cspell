import type { VFileSystem } from '../fileSystem.js';
import { getVirtualFS } from '../fileSystem.js';

type EntryType = 'file' | 'directory' | '!file' | '!directory';

export type FindUpFileSystem = Pick<VFileSystem, 'stat'>;

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
    const { type: entryType = 'file', stopAt, fs = getVirtualFS().fs } = options;
    let dir = new URL('.', from);
    const root = new URL('/', dir);
    const predicate = makePredicate(fs, name, entryType);
    const stopAtDir = stopAt || root;

    let last = '';
    while (dir.href !== last) {
        const found = await predicate(dir);
        if (found !== undefined) return found;
        last = dir.href;
        if (dir.href === root.href || dir.href === stopAtDir.href) break;
        dir = new URL('..', dir);
    }
    return undefined;
}

function makePredicate(
    fs: FindUpFileSystem,
    name: string | string[] | FindUpPredicate,
    entryType: EntryType,
): FindUpPredicate {
    if (typeof name === 'function') return name;

    const checkStat = entryType === 'file' || entryType === '!file' ? 'isFile' : 'isDirectory';
    const checkValue = entryType.startsWith('!') ? false : true;

    function checkName(dir: URL, name: string) {
        const f = new URL(name, dir);
        return fs
            .stat(f)
            .then((stats) => ((stats.isUnknown() || stats[checkStat]() === checkValue) && f) || undefined)
            .catch(() => undefined);
    }

    if (!Array.isArray(name)) return (dir) => checkName(dir, name);

    return async (dir) => {
        const pending = name.map((n) => checkName(dir, n));
        for (const p of pending) {
            const found = await p;
            if (found) return found;
        }
        return undefined;
    };
}
