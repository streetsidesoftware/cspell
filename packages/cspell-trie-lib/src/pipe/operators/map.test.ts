import { opMap } from '.';
import { toArray } from '../helpers';
import { pipeAsync, pipeSync } from '../pipe';

describe('Validate map', () => {
    test('map', async () => {
        const values = ['one', 'two', 'three'];

        const mapFn = (v: string) => v.length;
        const mapFn2 = (v: number) => v * 2;

        const expected = values.map(mapFn).map(mapFn2);

        const mapToLen = opMap(mapFn);

        const s = pipeSync(values, mapToLen, opMap(mapFn2));
        const a = pipeAsync(values, mapToLen, opMap(mapFn2));

        const sync = toArray(s);
        const async = await toArray(a);

        expect(sync).toEqual(expected);
        expect(async).toEqual(expected);
    });
});
