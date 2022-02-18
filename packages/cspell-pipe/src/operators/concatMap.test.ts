import { opConcatMap } from '.';
import { toArray } from '../helpers';
import { pipeAsync, pipeSync } from '../pipe';

describe('Validate map', () => {
    test('map', async () => {
        const values = ['one', 'two', 'three'];

        const mapFn = (v: string) => v.split('').concat(['|']);
        const mapFn2 = (v: string) => [v, v.toUpperCase()];

        const expected = 'one|two|three|'
            .split('')
            .map(mapFn2)
            .reduce((a, b) => a.concat(b), []);

        const mapToLen = opConcatMap(mapFn);

        const s = pipeSync(values, mapToLen, opConcatMap(mapFn2));
        const a = pipeAsync(values, mapToLen, opConcatMap(mapFn2));

        const sync = toArray(s);
        const async = await toArray(a);

        expect(sync).toEqual(expected);
        expect(async).toEqual(expected);
    });
});
