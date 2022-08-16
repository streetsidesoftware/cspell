import { pipeAsync, pipeSync, toArray } from '..';
import { fibonacci } from '../test/fibonacci';
import { opAppend, opAppendAsync } from './append';
import { opTake } from './take';
import { toAsyncIterable } from '../helpers';

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
