import { CheckFailed, ApplicationError, toError, isError, toApplicationError, IOError } from './errors';

const oc = expect.objectContaining;

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
        error                                                                 | expected
        ${new CheckFailed('CheckFailed')}                                     | ${new Error('CheckFailed')}
        ${new ApplicationError('App Error')}                                  | ${new Error('App Error')}
        ${{ message: 'msg', name: 'error' }}                                  | ${oc({ message: 'msg', name: 'error' })}
        ${'hello'}                                                            | ${oc({ name: 'error', message: 'hello' })}
        ${null}                                                               | ${oc({ name: 'error', message: 'null' })}
        ${undefined}                                                          | ${oc({ name: 'error', message: 'undefined' })}
        ${42}                                                                 | ${oc({ name: 'error', message: '42' })}
        ${{}}                                                                 | ${oc({ name: 'error', message: '{}' })}
        ${new IOError('io', { name: 'err', message: 'msg', code: 'ENOENT' })} | ${new Error('io')}
    `('toError $error', ({ error, expected }) => {
        expect(toError(error)).toEqual(expected);
    });

    test.each`
        error                                | expected
        ${new CheckFailed('CheckFailed')}    | ${new Error('CheckFailed')}
        ${new ApplicationError('App Error')} | ${new Error('App Error')}
        ${{ message: 'msg', name: 'error' }} | ${new Error('msg')}
        ${'hello'}                           | ${new Error('hello')}
        ${{}}                                | ${new Error('{}')}
    `('toError $error', ({ error, expected }) => {
        expect(toApplicationError(error)).toEqual(expected);
    });

    test('IOError', () => {
        const cause = toError({ name: 'err', message: 'msg', code: 'ENOENT' });
        const err = new IOError('io', cause);
        expect(err.code).toBe('ENOENT');
        expect(err.isNotFound()).toBe(true);
    });
});
