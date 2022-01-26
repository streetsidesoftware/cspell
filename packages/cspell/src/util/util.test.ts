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

    test.each`
        text       | n     | expected
        ${''}      | ${0}  | ${''}
        ${'hello'} | ${0}  | ${'hello'}
        ${'hello'} | ${-1} | ${'hello'}
        ${'a'}     | ${3}  | ${'  a'}
    `('padLeft', ({ text, n, expected }) => {
        expect(util.padLeft(text, n)).toBe(expected);
    });

    test.each`
        text       | n     | expected
        ${''}      | ${0}  | ${''}
        ${'hello'} | ${0}  | ${'hello'}
        ${'hello'} | ${-1} | ${'hello'}
        ${'a'}     | ${3}  | ${'a  '}
    `('pad', ({ text, n, expected }) => {
        expect(util.pad(text, n)).toBe(expected);
    });
});
