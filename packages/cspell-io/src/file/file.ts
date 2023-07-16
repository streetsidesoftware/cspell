import { getDefaultCSpellIO } from '../CSpellIONode.js';
import { toError } from '../errors/index.js';
import type { BufferEncoding } from '../models/BufferEncoding.js';
import type { Stats } from '../models/index.js';
import type {
    getStat as GetStatFn,
    getStatSync as GetStatSyncFn,
    readFileText as ReadFileTextFn,
    readFileTextSync as ReadFileTextSyncFn,
} from '../node/file/index.js';

export const readFileText: typeof ReadFileTextFn = function (
    filename: string | URL,
    encoding?: BufferEncoding,
): Promise<string> {
    return getDefaultCSpellIO()
        .readFile(filename, encoding)
        .then((fr) => fr.content);
};

export const readFileTextSync: typeof ReadFileTextSyncFn = function (
    filename: string | URL,
    encoding?: BufferEncoding,
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
