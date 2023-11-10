import { describe, expect, test } from 'vitest';

import { AssertionError, ErrorNotImplemented } from './errors.js';

describe('errors', () => {
    test.each`
        error                  | message   | expected
        ${ErrorNotImplemented} | ${'test'} | ${'Method test is not supported.'}
        ${AssertionError}      | ${'test'} | ${'test'}
    `('ErrorNotImplemented', ({ error, message, expected }) => {
        const err = new error(message);
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe(expected);
    });
});
