import { describe, expect, test } from 'vitest';
import { pipeAsync, pipeSync, toArray } from '../index.js';
import { fibonacci } from '../test/fibonacci.js';
import { opAppend, opAppendAsync } from './append.js';
import { opTake } from './take.js';
import { toAsyncIterable } from '../helpers/index.js';

describe('append', () => {
    test('sync', () => {
        expect([...pipeSync(fibonacci(), opTake(5), opAppend([6, 6], [7, 7]))]).toEqual([0, 1, 1, 2, 3, 6, 6, 7, 7]);
    });

    test('async', async () => {
        expect(await toArray(pipeAsync(fibonacci(), opTake(5), opAppend([6, 6], [7, 7])))).toEqual([
            0, 1, 1, 2, 3, 6, 6, 7, 7,
        ]);
    });

    test('async with async', async () => {
        expect(
            await toArray(pipeAsync(fibonacci(), opTake(5), opAppendAsync(toAsyncIterable([6, 6]), [7, 7])))
        ).toEqual([0, 1, 1, 2, 3, 6, 6, 7, 7]);
    });
});
