import { readStdin } from './stdin';
import { mergeAsyncIterables, asyncIterableToArray } from './util';
import * as readline from 'readline';

jest.mock('readline');
const mockCreateInterface = jest.mocked(readline.createInterface);

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
