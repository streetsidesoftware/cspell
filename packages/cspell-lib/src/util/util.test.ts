import * as util from './util';

describe('Validate util', () => {
    test('tests uniqueFilterFnGenerator', () => {
        const values = [1, 2, 4, 5, 3, 2, 1, 2, 3, 4, 5, 6, 7, 8];
        const uniqFilter = util.uniqueFilterFnGenerator<number>();
        expect(values.filter(uniqFilter).sort()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    test('tests uniqueFilterFnGenerator with extractor', () => {
        interface Word {
            word: string;
        }
        const values: Word[] = [{ word: 'hello' }, { word: 'there' }, { word: 'hello' }];
        const uniqFilter = util.uniqueFilterFnGenerator((w: Word) => w.word);
        expect(values.filter(uniqFilter)).toEqual([values[0], values[1]]);
    });

    test('tests unique', () => {
        expect(util.unique([])).toEqual([]);
        expect(util.unique([4, 3, 2, 1])).toEqual([4, 3, 2, 1]);
        expect(util.unique([4, 4, 3, 2, 3, 1, 2])).toEqual([4, 3, 2, 1]);
    });

    test('tests clean up obj', () => {
        const obj = {
            a: undefined,
            b: 1,
            c: true,
            d: undefined,
            e: 'str',
        };
        const cleanObj = util.clean(obj);
        expect([...Object.keys(cleanObj)]).toEqual(['b', 'c', 'e']);
    });

    test('scan map with no init', () => {
        const v = [1, 2, 3, 4, 5, 6];
        let sum = 0;
        const r = v.map(util.scanMap((a, v) => ((sum += v - a), v)));
        expect(r).toEqual(v);
        expect(sum).toBe(5);
    });

    const obj = { v: 'hello' };
    const arr = [1, 2, 3];

    test.each`
        a              | b              | expected
        ${[]}          | ${[]}          | ${true}
        ${[1, 2, 3]}   | ${[1, 2, 3]}   | ${true}
        ${[3, 2, 1]}   | ${[1, 2, 3]}   | ${false}
        ${[]}          | ${[1, 2, 3]}   | ${false}
        ${[3, 2, 1]}   | ${[]}          | ${false}
        ${[1, '2', 3]} | ${[1, '2', 3]} | ${true}
        ${[1, {}, 3]}  | ${[1, {}, 3]}  | ${false}
        ${[1, [], 3]}  | ${[1, [], 3]}  | ${false}
        ${[1, obj, 3]} | ${[1, obj, 3]} | ${true}
        ${[1, arr, 3]} | ${[1, arr, 3]} | ${true}
        ${arr}         | ${arr}         | ${true}
    `('isArrayEqual $a $b', ({ a, b, expected }) => {
        expect(util.isArrayEqual(a, b)).toBe(expected);
    });
});
