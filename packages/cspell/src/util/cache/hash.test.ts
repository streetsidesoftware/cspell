import { hash } from './hash';

describe('hash', () => {
    test.each`
        value      | expected
        ${''}      | ${'0'}
        ${'0'}     | ${'1me2ikf'}
        ${'1'}     | ${'1537r83'}
        ${'a'}     | ${'gos6uq'}
        ${'hello'} | ${'a5205j'}
    `('hash $value', ({ value, expected }) => {
        expect(hash(value)).toBe(expected);
    });
});
