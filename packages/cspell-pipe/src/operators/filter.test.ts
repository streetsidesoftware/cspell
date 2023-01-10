/* eslint-disable unicorn/no-array-callback-reference */
import { describe, expect, test } from 'vitest';
import { toArray, toAsyncIterable } from '../helpers/index.js';
import { pipeAsync, pipeSync } from '../pipe.js';
import { opFilter, opFilterAsync } from './filter.js';

describe('Validate filter', () => {
    test('filter', async () => {
        const values = ['one', 'two', 'three'];

        const filterFn = (v: string) => v.length === 3;

        const expected = values.filter(filterFn);

        const filterToLen = opFilter(filterFn);

        const s = pipeSync(values, filterToLen);
        const a = pipeAsync(values, filterToLen);

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
        ${[true, Promise.resolve(false), Promise.resolve(''), 'hello']} | ${[true, 'hello']}
        ${[0, Promise.resolve('hey')]}                                  | ${['hey']}
    `(
        'filter async',
        async ({ values, expected }: { values: (Primitives | PromisePrim)[]; expected: Primitives[] }) => {
            const isTruthy = async (v: Primitives) => !!(await v);
            const aValues = pipeAsync(values, opFilterAsync<Primitives | PromisePrim>(isTruthy));
            const result = await toArray(aValues);
            expect(result).toEqual(expected);
        }
    );

    test('is a', async () => {
        function isString(a: unknown): a is string {
            return typeof a === 'string';
        }
        const filtered = pipeAsync(['string', 4, {}, 'hello', undefined], opFilterAsync(isString));

        expect(await toArray(filtered)).toEqual(['string', 'hello']);
    });

    test('async filter', async () => {
        function isString(a: unknown): a is string {
            return typeof a === 'string';
        }
        async function truthyAsync(a: unknown): Promise<boolean> {
            return !!(await a);
        }
        const filtered = pipeAsync(
            [
                Promise.resolve('string'),
                '',
                4,
                {},
                'hello',
                Promise.resolve(),
                Promise.resolve(Promise.resolve(Promise.resolve('deep'))),
            ],
            opFilterAsync(truthyAsync),
            opFilter(isString)
        );

        expect(await toArray(filtered)).toEqual(['string', 'hello', 'deep']);
    });

    test('filter isDefined', async () => {
        const values = ['a', 'b', undefined, 'c', 'd'];
        const expected = values.filter(isDefined);

        const s: Iterable<string> = pipeSync(values, opFilter(isDefined));
        const a: AsyncIterable<string> = pipeAsync(toAsyncIterable(values), opFilter(isDefined));

        const sync = toArray(s);
        const async = await toArray(a);

        expect(sync).toEqual(expected);
        expect(async).toEqual(expected);
    });
});

function isDefined<T>(v: Exclude<T, undefined> | undefined): v is Exclude<T, undefined> {
    return v !== undefined;
}
