import { promises as fs, statSync } from 'fs';
import { format } from 'util';
import { fetchHead } from './fetch';
import { isFileURL, isUrlLike, toURL } from './util';

/**
 * Copied from the Node definition to avoid a dependency upon a specific version of Node
 */
interface StatsBase<T> {
    // dev: T;
    // ino: T;
    // mode: T;
    // nlink: T;
    // uid: T;
    // gid: T;
    // rdev: T;
    size: T;
    // blksize: T;
    // blocks: T;
    // atimeMs: T;
    mtimeMs: T;
    // ctimeMs: T;
    // birthtimeMs: T;
    // atime: Date;
    // mtime: Date;
    // ctime: Date;
    // birthtime: Date;
    eTag?: string | undefined;
}

export async function getStat(filenameOrUri: string): Promise<Stats | Error> {
    if (isUrlLike(filenameOrUri)) {
        const url = toURL(filenameOrUri);
        if (!isFileURL(url)) {
            try {
                const headers = await fetchHead(url);
                return {
                    size: Number.parseInt(headers.get('content-length') || '0', 10),
                    mtimeMs: 0,
                    eTag: headers.get('etag') || undefined,
                };
            } catch (e) {
                return toError(e);
            }
        }
    }
    return fs.stat(filenameOrUri).catch((e) => toError(e));
}

export function getStatSync(uri: string): Stats | Error {
    try {
        return statSync(uri);
    } catch (e) {
        return toError(e);
    }
}

function toError(e: unknown): Error {
    if (isErrnoException(e) || e instanceof Error) return e;
    return new Error(format(e));
}

function isErrnoException(e: unknown | NodeJS.ErrnoException): e is NodeJS.ErrnoException {
    if (!e || typeof e !== 'object') return false;
    const err = e as NodeJS.ErrnoException;
    return err.message !== undefined && err.name !== undefined;
}

export type Stats = StatsBase<number>;
