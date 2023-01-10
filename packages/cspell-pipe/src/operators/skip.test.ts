import { describe, expect, test } from 'vitest';
import { pipeAsync, pipeSync, toArray } from '../index.js';
import { fibonacci } from '../test/fibonacci.js';
import { opSkip } from './skip.js';
import { opTake } from './take.js';

describe('skip', () => {
    test('sync', () => {
        expect([...pipeSync(fibonacci(), opSkip(3), opTake(5))]).toEqual([2, 3, 5, 8, 13]);
    });

    test('async', async () => {
        expect(await toArray(pipeAsync(fibonacci(), opSkip(3), opTake(5)))).toEqual([2, 3, 5, 8, 13]);
    });
});
