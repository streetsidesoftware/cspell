import { format } from 'util';
export class CheckFailed extends Error {
    constructor(message: string, readonly exitCode: number = 1) {
        super(message);
    }
}

export class ApplicationError extends Error {
    constructor(message: string, readonly exitCode: number = 1, readonly cause?: Error) {
        super(message);
    }
}

export function toError(e: unknown): Error {
    if (isError(e)) return e;
    return {
        name: 'error',
        message: format(e),
    };
}

export function isError(e: unknown): e is Error {
    if (e instanceof Error) return true;
    if (!e || typeof e !== 'object') return false;
    const ex = <Error>e;
    return typeof ex.message === 'string';
}

export function toApplicationError(e: unknown, message?: string): ApplicationError {
    if (e instanceof ApplicationError) return e;
    const err = toError(e);
    return new ApplicationError(message ?? err.message, undefined, err);
}
