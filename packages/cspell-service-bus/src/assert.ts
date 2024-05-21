export function assert(value: unknown, message?: string | Error): asserts value {
    if (!value) {
        const err = message instanceof Error ? message : new Error(message ?? 'AssertionError');
        throw err;
    }
}
