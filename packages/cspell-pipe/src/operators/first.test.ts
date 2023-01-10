import { describe, expect, test } from 'vitest';
import { toArray, toAsyncIterable } from '../helpers/index.js';
import { pipeAsync, pipeSync } from '../pipe.js';
import { opFirst, opFirstAsync } from './first.js';

describe('Validate first', () => {
    test('first', async () => {
        const values = ['four', 'one', 'two', 'three'];

        const firstFn = (v: string) => v.length === 3;

        const expected = ['one'];

        const firstThreeLetterWord = opFirst(firstFn);

        const s = pipeSync(values, firstThreeLetterWord);
        const a = pipeAsync(values, firstThreeLetterWord);

        const sync = toArray(s);
        const async = await toArray(a);

        expect(sync).toEqual(expected);
        expect(async).toEqual(expected);
    });

    type Primitives = string | number | boolean;
    type PromisePrim = Promise<string> | Promise<number> | Promise<boolean>;

    test.each`
        values                                                          | expected
        ${[]}                                                           | ${[]}
        ${[true, Promise.resolve(false), Promise.resolve(''), 'hello']} | ${[true]}
        ${[0, Promise.resolve('hey'), true]}                            | ${['hey']}
    `('first async', async ({ values, expected }: { values: (Primitives | PromisePrim)[]; expected: Primitives[] }) => {
        const isTruthy = async (v: Primitives) => !!(await v);
        const aValues = pipeAsync(values, opFirstAsync<Primitives | PromisePrim>(isTruthy));
        const result = await toArray(aValues);
        expect(result).toEqual(expected);
    });

    test('is a', async () => {
        function isString(a: unknown): a is string {
            return typeof a === 'string';
        }
        const values = pipeAsync([5, 'string', 4, {}, 'hello', undefined], opFirstAsync(isString));

        expect(await toArray(values)).toEqual(['string']);
    });

    test('async first', async () => {
        function isString(a: unknown): a is string {
            return typeof a === 'string';
        }
        async function truthyAsync(a: unknown): Promise<boolean> {
            return !!(await a);
        }
        const values = pipeAsync(
            [
                false,
                Promise.resolve('string'),
                '',
                4,
                {},
                'hello',
                Promise.resolve(),
                Promise.resolve(Promise.resolve(Promise.resolve('deep'))),
            ],
            opFirstAsync(truthyAsync),
            opFirst(isString)
        );

        expect(await toArray(values)).toEqual(['string']);
    });

    test('first isDefined', async () => {
        const values = [undefined, 'a', 'b', undefined, 'c', 'd'];
        const expected = ['a'];

        const s: Iterable<string> = pipeSync(values, opFirst(isDefined));
        const a: AsyncIterable<string> = pipeAsync(toAsyncIterable(values), opFirst(isDefined));

        const sync = toArray(s);
        const async = await toArray(a);

        expect(sync).toEqual(expected);
        expect(async).toEqual(expected);
    });
});

function isDefined<T>(v: Exclude<T, undefined> | undefined): v is Exclude<T, undefined> {
    return v !== undefined;
}
