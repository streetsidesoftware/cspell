export function toError(e: unknown): Error {
    if (e instanceof Error) return e;
    if (typeof e === 'object' && e && typeof (e as Error).message === 'string') {
        return e as Error;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Error(e && (e as any).toString());
}
