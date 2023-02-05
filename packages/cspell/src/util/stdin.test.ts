import * as readline from 'readline';
import { describe, test, expect, vi } from 'vitest';

import { asyncIterableToArray, mergeAsyncIterables } from './async';
import { readStdin } from './stdin';

vi.mock('readline');
const mockCreateInterface = vi.mocked(readline.createInterface);

describe('stdin', () => {
    test('reading stdin', async () => {
        const values = ['one', 'two'];
        const mockRL = {
            [Symbol.asyncIterator]: () => mergeAsyncIterables(values),
        };
        mockCreateInterface.mockReturnValue(mockRL as ReturnType<typeof readline.createInterface>);

        const r = await asyncIterableToArray(readStdin());
        expect(r).toEqual(values);
    });
});
