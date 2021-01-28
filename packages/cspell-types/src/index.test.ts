import * as index from './index';

describe('Validate that the types build', () => {
    test('No code to be exported.', () => {
        expect(index).toEqual({});
    });
});
