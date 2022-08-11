import { getDefaultCSpellIO } from '../CSpellIONode';
import { toError } from '../errors';
import { Stats } from '../models';
import type { BufferEncoding } from '../models/BufferEncoding';
import type {
    getStat as GetStatFn,
    getStatSync as GetStatSyncFn,
    readFile as ReadFileFn,
    readFileSync as ReadFileSyncFn,
} from '../node/file';

export const readFile: typeof ReadFileFn = function (
    filename: string | URL,
    encoding?: BufferEncoding
): Promise<string> {
    return getDefaultCSpellIO()
        .readFile(filename, encoding)
        .then((fr) => fr.content);
};

export const readFileSync: typeof ReadFileSyncFn = function (
    filename: string | URL,
    encoding?: BufferEncoding
): string {
    return getDefaultCSpellIO().readFileSync(filename, encoding).content;
};

export const getStat: typeof GetStatFn = function (filenameOrUri: string): Promise<Stats | Error> {
    return getDefaultCSpellIO().getStat(filenameOrUri).catch(toError);
};

export const getStatSync: typeof GetStatSyncFn = function (filenameOrUri: string): Stats | Error {
    try {
        return getDefaultCSpellIO().getStatSync(filenameOrUri);
    } catch (e) {
        return toError(e);
    }
};
