import * as readline from 'node:readline';

import { describe, expect, test, vi } from 'vitest';

import { asyncIterableToArray, mergeAsyncIterables } from './async.js';
import { readStdin } from './stdin.js';

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

    test('ignores readline closed after reading stdin', async () => {
        async function* throwAfterRead() {
            yield 'one';
            yield 'two';
            throw new Error('readline was closed');
        }
        const mockRL = {
            [Symbol.asyncIterator]: throwAfterRead,
        };
        mockCreateInterface.mockReturnValue(mockRL as ReturnType<typeof readline.createInterface>);

        const r = await asyncIterableToArray(readStdin());
        expect(r).toEqual(['one', 'two']);
    });

    test('throws other readline errors', async () => {
        async function* throwAfterRead() {
            yield 'one';
            throw new Error('readline failed');
        }
        const mockRL = {
            [Symbol.asyncIterator]: throwAfterRead,
        };
        mockCreateInterface.mockReturnValue(mockRL as ReturnType<typeof readline.createInterface>);

        await expect(asyncIterableToArray(readStdin())).rejects.toThrow('readline failed');
    });
});
