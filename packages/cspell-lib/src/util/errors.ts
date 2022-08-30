import { format } from 'util';

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
        typeof ex.errno in allowNumberOrUndefined &&
        typeof ex.code in allowStringOrUndefined &&
        typeof ex.path in allowStringOrUndefined
    );
}

export function isError(e: unknown): e is Error {
    if (e instanceof Error) return true;
    if (!e || typeof e !== 'object') return false;
    const ex = <Error>e;
    return typeof ex.name == 'string' && typeof ex.message == 'string' && typeof ex.stack in allowStringOrUndefined;
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

export const __testing__ = {
    getTypeOf,
};
