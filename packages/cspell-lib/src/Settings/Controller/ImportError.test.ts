import { UnsupportedSchema, UnsupportedPnpFile, ImportError } from './ImportError';

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
