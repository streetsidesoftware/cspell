import { asyncAwait, map } from '.';
import { toArray } from '../helpers';
import { pipeAsync } from '../pipe';

describe('Validate await', () => {
    test('asyncAwait', async () => {
        const values = ['one', 'two', 'three'];

        const mapFn = (v: string) => v.length;
        const mapFn2 = (v: number) => v * 2;

        const expected = values.map(mapFn).map(mapFn2);
        const mapToLen = map(mapFn);
        const a = pipeAsync(values, map(toPromise), asyncAwait(), mapToLen, map(mapFn2));
        const async = await toArray(a);

        expect(async).toEqual(expected);
    });
});

function toPromise<T>(t: T): Promise<T> {
    return Promise.resolve(t);
}
