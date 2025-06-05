import { describe, expect, test } from 'vitest';

import { ApplicationError, CheckFailed, IOError, isErrorLike, toError } from './errors.js';

const oc = expect.objectContaining.bind(expect);

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
        expect(isErrorLike(error)).toBe(expected);
    });

    test.each`
        error                                                                 | expected
        ${new CheckFailed('CheckFailed')}                                     | ${new CheckFailed('CheckFailed')}
        ${new ApplicationError('App Error')}                                  | ${new ApplicationError('App Error')}
        ${{ message: 'msg', name: 'error' }}                                  | ${oc({ message: 'msg' })}
        ${'hello'}                                                            | ${oc({ message: 'hello' })}
        ${null}                                                               | ${oc({ message: 'null' })}
        ${undefined}                                                          | ${oc({ message: 'undefined' })}
        ${42}                                                                 | ${oc({ message: '42' })}
        ${{}}                                                                 | ${oc({ message: '{}' })}
        ${new IOError('io', { name: 'err', message: 'msg', code: 'ENOENT' })} | ${new IOError('io', { name: 'err', message: 'msg', code: 'ENOENT' })}
    `('toError $error', ({ error, expected }) => {
        expect(toError(error)).toEqual(expected);
    });

    test.each`
        error                                | expected
        ${new CheckFailed('CheckFailed')}    | ${new CheckFailed('CheckFailed')}
        ${new ApplicationError('App Error')} | ${new ApplicationError('App Error')}
        ${{ message: 'msg', name: 'error' }} | ${new Error('msg')}
        ${'hello'}                           | ${new Error('hello')}
        ${{}}                                | ${new Error('{}')}
    `('toError $error', ({ error, expected }) => {
        const e = toError(error);
        expect(e).toEqual(expected);
    });

    test('IOError', () => {
        const cause = toError({ name: 'err', message: 'msg', code: 'ENOENT' });
        const err = new IOError('io', cause);
        expect(err.code).toBe('ENOENT');
        expect(err.isNotFound()).toBe(true);
    });
});
