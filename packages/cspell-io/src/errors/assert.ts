import { AssertionError } from './errors.js';

export function assert(value: unknown, message?: string): asserts value {
    if (!value) {
        throw new AssertionError(message ?? 'Assertion failed');
    }
}
