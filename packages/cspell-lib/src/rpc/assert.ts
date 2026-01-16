export function assert(condition: unknown, msg?: string): asserts condition {
    if (!condition) {
        throw new AssertionError(msg);
    }
}

export class AssertionError extends Error {
    constructor(message?: string) {
        super(message || 'Assertion failed');
        this.name = 'AssertionError';
    }
}
