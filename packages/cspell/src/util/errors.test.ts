import { CheckFailed } from './errors';

describe('errors', () => {
    test.each`
        ErrorClass     | params
        ${CheckFailed} | ${['no matches']}
    `('new', ({ ErrorClass, params }) => {
        const e = new ErrorClass(...params);
        expect(e instanceof Error).toBe(true);
    });
});
