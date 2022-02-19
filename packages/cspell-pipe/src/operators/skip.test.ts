import { pipeAsync, pipeSync, toArray } from '..';
import { fibonacci } from '../test/fibonacci';
import { opTake } from './take';
import { opSkip } from './skip';

describe('skip', () => {
    test('sync', () => {
        expect([...pipeSync(fibonacci(), opSkip(3), opTake(5))]).toEqual([2, 3, 5, 8, 13]);
    });

    test('async', async () => {
        expect(await toArray(pipeAsync(fibonacci(), opSkip(3), opTake(5)))).toEqual([2, 3, 5, 8, 13]);
    });
});
