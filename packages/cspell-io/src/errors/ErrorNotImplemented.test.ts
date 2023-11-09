import { describe, expect, test } from 'vitest';

import { ErrorNotImplemented } from './ErrorNotImplemented.js';

describe('ErrorNotImplemented', () => {
    test('ErrorNotImplemented', () => {
        const err = new ErrorNotImplemented('test');
        expect(err).toBeInstanceOf(Error);
        expect(err).toBeInstanceOf(ErrorNotImplemented);
        expect(err.message).toBe('Method test is not supported.');
    });
});
