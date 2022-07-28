import { format } from 'util';

export function toError(e: unknown): Error {
    if (e instanceof Error) return e;
    if (typeof e === 'object' && e && (e as Error).message) {
        return e as Error;
    }
    return Error(format(e));
}
