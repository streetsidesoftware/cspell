import { opFilter } from '.';
import { toArray, toAsyncIterable } from '../helpers';
import { pipeAsync, pipeSync } from '../pipe';

describe('Validate filter', () => {
    test('filter', async () => {
        const values = ['one', 'two', 'three'];

        const filterFn = (v: string) => v.length === 3;

        const expected = values.filter(filterFn);

        const filterToLen = opFilter(filterFn);

        const s = pipeSync(values, filterToLen);
        const a = pipeAsync(toAsyncIterable(values), filterToLen);

        const sync = toArray(s);
        const async = await toArray(a);

        expect(sync).toEqual(expected);
        expect(async).toEqual(expected);
    });

    test('filter isDefined', async () => {
        const values = ['a', 'b', undefined, 'c', 'd'];
        const expected = values.filter(isDefined);

        const s: Iterable<string> = pipeSync(values, opFilter(isDefined));
        const a: AsyncIterable<string> = pipeAsync(toAsyncIterable(values), opFilter(isDefined));

        const sync = toArray(s);
        const async = await toArray(a);

        expect(sync).toEqual(expected);
        expect(async).toEqual(expected);
    });
});

function isDefined<T>(v: Exclude<T, undefined> | undefined): v is Exclude<T, undefined> {
    return v !== undefined;
}
