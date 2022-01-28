import { filter } from '.';
import { toArray, toAsyncIterable } from '../helpers';
import { pipeAsync, pipeSync } from '../pipe';

describe('Validate filter', () => {
    test('filter', async () => {
        const values = ['one', 'two', 'three'];

        const filterFn = (v: string) => v.length === 3;

        const expected = values.filter(filterFn);

        const filterToLen = filter(filterFn);

        const s = pipeSync(values, filterToLen);
        const a = pipeAsync(toAsyncIterable(values), filterToLen);

        const sync = toArray(s);
        const async = await toArray(a);

        expect(sync).toEqual(expected);
        expect(async).toEqual(expected);
    });
});
