import { assert } from './assert';

function catchError<T>(fn: () => T): Error | T {
    try {
        return fn();
    } catch (err) {
        return err as Error;
    }
}

describe('assert', () => {
    test.each`
        value        | message                   | expected
        ${true}      | ${undefined}              | ${undefined}
        ${1}         | ${undefined}              | ${undefined}
        ${'yes'}     | ${undefined}              | ${undefined}
        ${undefined} | ${undefined}              | ${Error('AssertionError')}
        ${0}         | ${undefined}              | ${Error('AssertionError')}
        ${null}      | ${undefined}              | ${Error('AssertionError')}
        ${''}        | ${undefined}              | ${Error('AssertionError')}
        ${false}     | ${undefined}              | ${Error('AssertionError')}
        ${false}     | ${'Must be true or fail'} | ${Error('Must be true or fail')}
        ${false}     | ${Error('my error')}      | ${Error('my error')}
    `('compare assert to node assert $value / $message', ({ value, message, expected }) => {
        expect(catchError(() => assert(value, message))).toEqual(expected);
    });
});
