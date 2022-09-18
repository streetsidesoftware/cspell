import { isDefined } from './util';

describe('Validate util', () => {
    test.each`
        value        | expected
        ${undefined} | ${false}
        ${0}         | ${true}
        ${false}     | ${true}
        ${''}        | ${true}
        ${null}      | ${true}
    `('isDefined', ({ value, expected }) => {
        expect(isDefined(value)).toBe(expected);
    });
});
