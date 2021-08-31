import * as index from './index';

describe('Validate that the types build', () => {
    test('Something is exported.', () => {
        expect(Object.keys(index).sort()).toEqual(['resolveModuleSync']);
    });
});
