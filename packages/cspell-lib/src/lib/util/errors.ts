import { format } from 'node:util';

function getTypeOf(t: unknown) {
    return typeof t;
}
type TypeOfTypes = ReturnType<typeof getTypeOf>;

type AllowedTypes = Partial<Record<TypeOfTypes, true>>;

const allowStringOrUndefined: AllowedTypes = {
    string: true,
    undefined: true,
};

const allowNumberOrUndefined: AllowedTypes = {
    number: true,
    undefined: true,
};

export function isErrnoException(e: unknown): e is NodeJS.ErrnoException {
    if (!e || typeof e !== 'object') return false;
    if (!isError(e)) return false;
    const ex = <NodeJS.ErrnoException>e;
    return (
        (typeof ex.errno) in allowNumberOrUndefined &&
        (typeof ex.code) in allowStringOrUndefined &&
        (typeof ex.path) in allowStringOrUndefined
    );
}

export function isError(e: unknown): e is Error {
    if (e instanceof Error) return true;
    if (!e || typeof e !== 'object') return false;
    const ex = <Error>e;
    return typeof ex.name == 'string' && typeof ex.message == 'string' && (typeof ex.stack) in allowStringOrUndefined;
}

export function toError(e: unknown, errorFactory: UnknownErrorConstructor = UnknownError): Error {
    if (isError(e)) return e;
    return new errorFactory(e);
}

interface UnknownErrorConstructor {
    new (cause: unknown): Error;
}

export class UnknownError extends Error {
    readonly cause: unknown;
    constructor(cause: unknown) {
        super(format(cause));
        this.cause = cause;
    }
}

type ErrorHandler<T> = (err: unknown) => T | undefined;

type ErrorHandlerP<T> = (err: unknown) => T | Promise<T> | undefined;
export function catchPromiseError<T>(p: undefined, handler: ErrorHandlerP<T>): undefined;
export function catchPromiseError<T>(p: Promise<T>, handler: ErrorHandlerP<T>): Promise<T | undefined>;
export function catchPromiseError<T>(
    p: Promise<T> | undefined,
    handler: ErrorHandler<T>,
): Promise<T | undefined> | undefined;
export function catchPromiseError<T>(
    p: Promise<T> | undefined,
    handler: ErrorHandler<T>,
): Promise<T | undefined> | undefined {
    if (p === undefined) return undefined;
    return _catchPromiseError(p, handler);
}

export function wrapCall<U>(fn: (...p: []) => U, handler: ErrorHandler<U>): (...p: []) => U | undefined;
export function wrapCall<P0, U>(fn: (...p: [P0]) => U, handler: ErrorHandler<U>): (...p: [P0]) => U | undefined;
export function wrapCall<P0, P1, U>(
    fn: (...p: [P0, P1]) => U,
    handler: ErrorHandler<U>,
): (...p: [P0, P1]) => U | undefined;
export function wrapCall<P extends unknown[], U>(
    fn: (...p: P) => U,
    handler: ErrorHandler<U>,
): (...p: P[]) => U | undefined;
export function wrapCall<P, U>(fn: (...p: P[]) => U, handler: ErrorHandler<U>): (...p: P[]) => U | undefined {
    return (...p: P[]) => {
        try {
            return fn(...p);
        } catch (e) {
            return handler(e);
        }
    };
}

async function _catchPromiseError<T>(p: Promise<T>, handler: ErrorHandler<T>): Promise<T | undefined> {
    try {
        return await p;
    } catch (e) {
        return handler(e);
    }
}

export const __testing__ = {
    getTypeOf,
};
