import { pipeAsync, pipeSync, toArray } from '..';
import { fibonacci } from '../test/fibonacci';
import { opTake } from './take';

describe('take', () => {
    test('sync', () => {
        expect([...pipeSync(fibonacci(), opTake(5))]).toEqual([0, 1, 1, 2, 3]);
    });

    test('async', async () => {
        expect(await toArray(pipeAsync(fibonacci(), opTake(5)))).toEqual([0, 1, 1, 2, 3]);
    });
});
