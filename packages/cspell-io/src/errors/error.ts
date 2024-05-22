export function toError(e: unknown): Error {
    if (e instanceof Error) return e;
    if (typeof e === 'object' && e && 'message' in e && typeof e.message === 'string') {
        return new Error(e.message, { cause: e });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Error(e && (e as any).toString());
}
