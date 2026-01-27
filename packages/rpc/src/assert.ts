/**
 * Note: This code is here to avoid a dependency on Node's 'assert' module.
 */

/**
 * Asserts that a condition is true.
 * @param condition - The condition to assert.
 * @param msg - optional message for the assertion error.
 * @throws {AssertionError} If the condition is false.
 */
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
