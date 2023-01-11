import { sumValues } from './index';

describe('index', () => {
    test.each`
        values    | expected
        ${[]}     | ${0}
        ${[1, 2]} | ${3}
    `('sumValues', ({ values, expected }) => {
        expect(sumValues(values)).toBe(expected);
    });
});
