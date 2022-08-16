import { pipeAsync, pipeSync, toArray, opTap } from '..';
import { fibonacci } from '../test/fibonacci';
import { opTake } from './take';

describe('take', () => {
    test.each`
        iter           | count | expected
        ${fibonacci()} | ${5}  | ${[0, 1, 1, 2, 3]}
        ${fibonacci()} | ${0}  | ${[]}
        ${fibonacci()} | ${-1} | ${[]}
        ${fibonacci()} | ${1}  | ${[0]}
    `('sync', ({ iter, count, expected }) => {
        let callCount = 0;

        expect([
            ...pipeSync(
                iter,
                opTap(() => callCount++),
                opTake(count)
            ),
        ]).toEqual(expected);
        expect(callCount).toBe(Math.max(0, count));
    });

    test.each`
        iter           | count | expected
        ${fibonacci()} | ${5}  | ${[0, 1, 1, 2, 3]}
        ${fibonacci()} | ${0}  | ${[]}
        ${fibonacci()} | ${-1} | ${[]}
        ${fibonacci()} | ${1}  | ${[0]}
    `('async', async ({ iter, count, expected }) => {
        let callCount = 0;

        expect(
            await toArray(
                pipeAsync(
                    iter,
                    opTap(() => callCount++),
                    opTake(count)
                )
            )
        ).toEqual(expected);
        expect(callCount).toBe(Math.max(0, count));
    });
});
