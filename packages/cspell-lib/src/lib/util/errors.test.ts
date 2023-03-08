import { describe, expect, test } from 'vitest';

import { __testing__, catchPromiseError, isErrnoException, isError, toError, UnknownError, wrapCall } from './errors';

class MyError extends Error {
    constructor(msg: string) {
        super(msg);
    }
}

describe('errors', () => {
    const ex1: NodeJS.ErrnoException = {
        name: 'name',
        message: 'message',
        get code() {
            return 'CODE';
        },
    };

    test.each`
        err                        | expected
        ${{}}                      | ${false}
        ${ex1}                     | ${true}
        ${{ ...ex1, errno: '42' }} | ${false}
    `('isErrnoException $err', ({ err, expected }) => {
        expect(isErrnoException(err)).toBe(expected);
    });

    test.each`
        value
        ${undefined}
        ${3}
        ${null}
        ${''}
    `('getTypeOf $value', ({ value }) => {
        expect(__testing__.getTypeOf(value)).toBe(typeof value);
    });

    test.each`
        value                                         | expected
        ${null}                                       | ${false}
        ${undefined}                                  | ${false}
        ${{}}                                         | ${false}
        ${new Error('error')}                         | ${true}
        ${new MyError('error')}                       | ${true}
        ${{ name: 'error', message: 'random error' }} | ${true}
        ${{ name: '', message: '' }}                  | ${true}
    `('isError $value', ({ value, expected }) => {
        expect(isError(value)).toBe(expected);
    });

    test.each`
        err               | expected
        ${Error('hello')} | ${Error('hello')}
        ${'hello'}        | ${Error('hello')}
        ${'hello'}        | ${expect.any(UnknownError)}
    `('toError', ({ err, expected }) => {
        expect(toError(err)).toEqual(expected);
    });

    test('catchPromiseError', async () => {
        await expect(catchPromiseError(Promise.resolve('hello'), () => undefined)).resolves.toBe('hello');
        await expect(catchPromiseError(Promise.reject('hello'), () => undefined)).resolves.toBe(undefined);
        await expect(catchPromiseError(Promise.reject('error'), (e) => e)).resolves.toBe('error');
        await expect(
            catchPromiseError(Promise.reject('error'), (e) => {
                throw e;
            })
        ).rejects.toBe('error');
    });

    function tr(err: unknown) {
        throw err;
    }

    function identity<T>(a: T): T {
        return a;
    }

    test.each`
        fn                 | param        | error        | expected
        ${identity}        | ${undefined} | ${undefined} | ${undefined}
        ${identity}        | ${'hello'}   | ${undefined} | ${'hello'}
        ${() => tr('err')} | ${undefined} | ${'err'}     | ${undefined}
    `('wrapCall', ({ fn, param, error, expected }) => {
        let err: unknown = undefined;
        function capture(e: unknown) {
            err = e;
            return undefined;
        }
        expect(wrapCall<unknown, unknown>(fn, capture)(param)).toEqual(expected);
        expect(err).toEqual(error);
    });
});
