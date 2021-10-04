import { CheckFailed, ApplicationError, toError, isError } from './errors';

describe('errors', () => {
    test.each`
        ErrorClass          | params
        ${CheckFailed}      | ${['no matches']}
        ${ApplicationError} | ${['App Error']}
    `('new $ErrorClass', ({ ErrorClass, params }) => {
        const e = new ErrorClass(...params);
        expect(e instanceof Error).toBe(true);
    });

    test.each`
        error                                | expected
        ${new CheckFailed('')}               | ${true}
        ${new ApplicationError('')}          | ${true}
        ${{ message: 'msg', name: 'error' }} | ${true}
        ${{ name: 'error' }}                 | ${false}
        ${{}}                                | ${false}
        ${null}                              | ${false}
        ${'hello'}                           | ${false}
    `('isError $error', ({ error, expected }) => {
        expect(isError(error)).toBe(expected);
    });

    test.each`
        error                                | expected
        ${new CheckFailed('CheckFailed')}    | ${new Error('CheckFailed')}
        ${new ApplicationError('App Error')} | ${new Error('App Error')}
        ${{ message: 'msg', name: 'error' }} | ${{ message: 'msg', name: 'error' }}
        ${'hello'}                           | ${{ name: 'error', message: 'hello' }}
        ${null}                              | ${{ name: 'error', message: 'null' }}
        ${undefined}                         | ${{ name: 'error', message: 'undefined' }}
        ${42}                                | ${{ name: 'error', message: '42' }}
        ${{}}                                | ${{ name: 'error', message: '{}' }}
    `('toError $error', ({ error, expected }) => {
        expect(toError(error)).toEqual(expected);
    });
});
