import { opMap } from '.';
import { toArray } from '../helpers';
import { pipeAsync, pipeSync } from '../pipe';
import { opTap } from './tap';

describe('Validate map', () => {
    test('map', async () => {
        const values = ['one', 'two', 'three'];

        const mapFn = (v: string) => v.length;
        const tapFn1 = jest.fn();
        const tapFn2 = jest.fn();

        const expected = values.map(mapFn);
        const mapToLen = opMap(mapFn);

        const s = pipeSync(values, opTap(tapFn1), mapToLen, opTap(tapFn2));
        toArray(s);
        expect(tapFn1.mock.calls.map((c) => c[0])).toEqual(values);
        expect(tapFn2.mock.calls.map((c) => c[0])).toEqual(expected);

        tapFn1.mockClear();
        tapFn2.mockClear();

        const a = pipeAsync(values, opTap(tapFn1), mapToLen, opTap(tapFn2));
        await toArray(a);

        expect(tapFn1.mock.calls.map((c) => c[0])).toEqual(values);
        expect(tapFn2.mock.calls.map((c) => c[0])).toEqual(expected);
    });
});
