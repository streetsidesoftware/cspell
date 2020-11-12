import * as lib from 'cspell';

/**
 * The main goal here is to make sure it compiles. The unit tests are just place holders.
 */
describe('Verify we can import cspell-io', () => {
    test('it exports functions', () => {
        expect(typeof lib.checkText).toBe('function');
    });
});
