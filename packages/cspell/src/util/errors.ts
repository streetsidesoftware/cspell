import { format } from 'node:util';
export class CheckFailed extends Error {
    constructor(
        message: string,
        readonly exitCode: number = 1,
    ) {
        super(message);
    }
}

export class ApplicationError extends Error {
    constructor(
        message: string,
        readonly exitCode: number = 1,
        readonly cause?: Error | undefined,
    ) {
        super(message);
    }
}

export class IOError extends ApplicationError {
    constructor(
        message: string,
        readonly cause: NodeError,
    ) {
        super(message, undefined, cause);
    }

    get code(): string | undefined {
        return this.cause.code;
    }

    isNotFound(): boolean {
        return this.cause.code === 'ENOENT';
    }
}

export function toError(e: unknown): NodeError {
    if (isError(e)) return e;
    if (isErrorLike(e)) {
        const ex: NodeError = new Error(e.message, { cause: e });
        if (e.code !== undefined) ex.code = e.code;
        return ex;
    }
    const message = format(e);
    return new Error(message);
}

export function isError(e: unknown): e is NodeError {
    return e instanceof Error;
}

export function isErrorLike(e: unknown): e is NodeError {
    if (e instanceof Error) return true;
    if (!e || typeof e !== 'object') return false;
    const ex = <Error>e;
    return typeof ex.message === 'string';
}

export function toApplicationError(e: unknown, message?: string): ApplicationError {
    if (e instanceof ApplicationError && !message) return e;
    const err = toError(e);
    return new ApplicationError(message ?? err.message, undefined, err);
}

export interface NodeError extends Error {
    code?: string;
    toString?: () => string;
}
