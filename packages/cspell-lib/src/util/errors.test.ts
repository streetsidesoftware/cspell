import { __testing__, isErrnoException, isError, toError, UnknownError } from './errors';

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
});
