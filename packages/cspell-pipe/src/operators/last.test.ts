import { describe, expect, test } from 'vitest';
import { toArray, toAsyncIterable } from '../helpers/index.js';
import { pipeAsync, pipeSync } from '../pipe.js';
import { opLast, opLastAsync } from './last.js';

describe('Validate last', () => {
    test('last', async () => {
        const values = ['four', 'one', 'two', 'three'];

        const lastFn = (v: string) => v.length === 3;

        const expected = ['two'];

        const lastThreeLetterWord = opLast(lastFn);

        const s = pipeSync(values, lastThreeLetterWord);
        const a = pipeAsync(values, lastThreeLetterWord);

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
        ${[true, Promise.resolve(false), Promise.resolve(''), 'hello']} | ${['hello']}
        ${[0, Promise.resolve('hey'), true, false]}                     | ${[true]}
    `('last async', async ({ values, expected }: { values: (Primitives | PromisePrim)[]; expected: Primitives[] }) => {
        const isTruthy = async (v: Primitives) => !!(await v);
        const aValues = pipeAsync(values, opLastAsync<Primitives | PromisePrim>(isTruthy));
        const result = await toArray(aValues);
        expect(result).toEqual(expected);
    });

    test('is a', async () => {
        function isString(a: unknown): a is string {
            return typeof a === 'string';
        }
        const values = pipeAsync([5, 'string', 4, {}, 'hello', undefined], opLastAsync(isString));

        expect(await toArray(values)).toEqual(['hello']);
    });

    test('async last', async () => {
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
            opLastAsync(truthyAsync),
            opLast(isString)
        );

        expect(await toArray(values)).toEqual(['deep']);
    });

    test('last isDefined', async () => {
        const values = [undefined, 'a', 'b', undefined, 'c', 'd', undefined];
        const expected = ['d'];

        const s: Iterable<string> = pipeSync(values, opLast(isDefined));
        const a: AsyncIterable<string> = pipeAsync(toAsyncIterable(values), opLast(isDefined));

        const sync = toArray(s);
        const async = await toArray(a);

        expect(sync).toEqual(expected);
        expect(async).toEqual(expected);
    });
});

function isDefined<T>(v: Exclude<T, undefined> | undefined): v is Exclude<T, undefined> {
    return v !== undefined;
}
