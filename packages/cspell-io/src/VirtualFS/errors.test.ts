import { describe, expect, test } from 'vitest';

import { VFSNotImplemented } from './errors.js';

describe('errors', () => {
    test('VFSNotImplemented', () => {
        const error = new VFSNotImplemented('test');
        expect(error).toBeInstanceOf(VFSNotImplemented);
        expect(error.message).toBe('Method test is not implemented');
    });
});
