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

export class IOError extends ApplicationError {
    constructor(message: string, readonly cause: NodeError) {
        super(message, undefined, cause);
    }

    get code(): string | undefined {
        return this.cause.code;
    }

    isNotFound() {
        return this.cause.code === 'ENOENT';
    }
}

export function toError(e: unknown): NodeError {
    if (isError(e)) return e;
    const message = format(e);
    return {
        name: 'error',
        message,
        toString: () => message,
    };
}

export function isError(e: unknown): e is NodeError {
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
