export interface NodeError extends Error {
    code?: string;
}

export function toError(err: unknown): NodeError {
    return isError(err) ? err : new Error(`${err}`);
}

export function isError(err: unknown): err is Error {
    if (err instanceof Error) return true;
    return false;
}
