export class FetchUrlError extends Error implements NodeJS.ErrnoException {
    constructor(
        message: string,
        readonly code: string | undefined,
        readonly status: number | undefined,
        readonly url: URL,
    ) {
        super(message);
        this.name = 'FetchUrlError';
    }

    static create(url: URL, status: number, message?: string): FetchUrlError {
        if (status === 404) return new FetchUrlError(message || 'URL not found.', 'ENOENT', status, url);
        if (status >= 400 && status < 500)
            return new FetchUrlError(message || 'Permission denied.', 'EACCES', status, url);
        return new FetchUrlError(message || 'Fatal Error', 'ECONNREFUSED', status, url);
    }

    static fromError(url: URL, e: Error): FetchUrlError {
        const cause = getCause(e);
        if (cause) {
            return new FetchUrlError(cause.message, cause.code, undefined, url);
        }
        if (isNodeError(e)) {
            return new FetchUrlError(e.message, e.code, undefined, url);
        }
        return new FetchUrlError(e.message, undefined, undefined, url);
    }
}

export function isNodeError(e: unknown): e is NodeJS.ErrnoException {
    if (e instanceof Error && 'code' in e && typeof e.code === 'string') return true;
    if (e && typeof e === 'object' && 'code' in e && typeof e.code === 'string') return true;
    return false;
}

export function isError(e: unknown): e is Error {
    return e instanceof Error;
}

interface ErrorWithOptionalCause extends Error {
    cause?: NodeJS.ErrnoException;
}

export function isErrorWithOptionalCause(e: unknown): e is ErrorWithOptionalCause {
    return isError(e) && (!('cause' in e) || isNodeError(e.cause) || isNodeError(e));
}

export function getCause(e: unknown): NodeJS.ErrnoException | undefined {
    return isErrorWithOptionalCause(e) ? e.cause : undefined;
}

export function toFetchUrlError(err: unknown, url: URL): FetchUrlError {
    return err instanceof FetchUrlError ? err : FetchUrlError.fromError(url, toError(err));
}

export function toError(err: unknown): Error {
    return err instanceof Error ? err : Error('Unknown Error', { cause: err });
}
