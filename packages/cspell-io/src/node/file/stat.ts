import { promises as fs, statSync } from 'fs';
import { format } from 'util';
import { fetchHead } from './fetch';
import { Stats } from '../../models/Stats';
import { isFileURL, isUrlLike, toURL } from './util';

export async function getStat(filenameOrUri: string): Promise<Stats | Error> {
    if (isUrlLike(filenameOrUri)) {
        const url = toURL(filenameOrUri);
        if (!isFileURL(url)) {
            try {
                return await getStatHttp(url);
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

export async function getStatHttp(url: URL): Promise<Stats> {
    const headers = await fetchHead(url);
    const eTag = headers.get('etag') || undefined;
    const guessSize = Number.parseInt(headers.get('content-length') || '0', 10);
    return {
        size: eTag ? -1 : guessSize,
        mtimeMs: 0,
        eTag,
    };
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
