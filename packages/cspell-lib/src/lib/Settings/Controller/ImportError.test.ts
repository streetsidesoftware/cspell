import { describe, expect, test } from 'vitest';

import { ImportError, UnsupportedPnpFile, UnsupportedSchema } from './ImportError.js';

describe('ImportError', () => {
    test.each`
        error
        ${new UnsupportedSchema('message')}
        ${new UnsupportedPnpFile('message')}
        ${new ImportError('message')}
    `('UnsupportedSchema', ({ error }) => {
        expect(error).toBeInstanceOf(Error);
    });
});
