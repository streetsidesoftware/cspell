import type { SuggestionCostMapDef } from './suggestionCostsDef';
import { addWeightedDefMapToTrie, __testing__ } from './weightedMaps';

const { splitMapSubstrings, splitMap } = __testing__;

// const u = undefined;

describe('Validate weightedMaps', () => {
    test.each`
        map             | expected
        ${''}           | ${[]}
        ${'abc'}        | ${'abc'.split('')}
        ${'f(ph)(gh)v'} | ${['f', 'ph', 'gh', 'v']}
    `('splitMapSubstrings "$map"', ({ map, expected }) => {
        expect(splitMapSubstrings(map)).toEqual(expected);
    });

    test.each`
        map                | expected
        ${''}              | ${[[]]}
        ${'||'}            | ${[[], [], []]}
        ${'abc'}           | ${['abc'.split('')]}
        ${'f(ph)(gh)v|eé'} | ${[['f', 'ph', 'gh', 'v'], ['e', 'é']]}
    `('splitMap "$map"', ({ map, expected }) => {
        expect(splitMap({ map })).toEqual(expected);
    });

    test.each`
        map      | insDel       | replace      | swap         | expected
        ${''}    | ${undefined} | ${undefined} | ${undefined} | ${{}}
        ${''}    | ${1}         | ${1}         | ${1}         | ${{}}
        ${'a'}   | ${1}         | ${undefined} | ${undefined} | ${{ a: { insDel: 1 } }}
        ${'ab'}  | ${1}         | ${undefined} | ${undefined} | ${{ a: { insDel: 1 }, b: { insDel: 1 } }}
        ${'a'}   | ${1}         | ${2}         | ${3}         | ${{ a: { insDel: 1, r: { a: { rep: 2, swap: 3 } } } }}
        ${'a'}   | ${0}         | ${0}         | ${0}         | ${{ a: { insDel: 0, r: { a: { rep: 0, swap: 0 } } } }}
        ${'ab'}  | ${undefined} | ${2}         | ${undefined} | ${{ a: { r: { a: { rep: 2 }, b: { rep: 2 } } }, b: { r: { a: { rep: 2 }, b: { rep: 2 } } } }}
        ${'a|b'} | ${undefined} | ${2}         | ${undefined} | ${{ a: { r: { a: { rep: 2 } } }, b: { r: { b: { rep: 2 } } } }}
    `('splitMap "$map"', ({ map, insDel, replace, swap, expected }) => {
        const def: SuggestionCostMapDef = {
            map,
            insDel,
            replace,
            swap,
        };
        expect(addWeightedDefMapToTrie(def)).toEqual(expected);
    });

    test.each`
        defA                          | defB                                     | expected
        ${{ map: '' }}                | ${{ map: '' }}                           | ${{}}
        ${{ map: '' }}                | ${{ map: 'b' }}                          | ${{ b: {} }}
        ${{ map: 'a' }}               | ${{ map: 'b' }}                          | ${{ a: {}, b: {} }}
        ${{ map: '(ab)' }}            | ${{ map: 'b' }}                          | ${{ a: { t: { b: {} } }, b: {} }}
        ${{ map: 'a', insDel: 5 }}    | ${{ map: 'a', insDel: 10 }}              | ${{ a: { insDel: 5 } }}
        ${{ map: 'a', insDel: 5 }}    | ${{ map: 'ab', insDel: 10 }}             | ${{ a: { insDel: 5 }, b: { insDel: 10 } }}
        ${{ map: 'a', replace: 5 }}   | ${{ map: 'ab', insDel: 10, replace: 3 }} | ${{ a: { insDel: 10, r: { a: { rep: 3 }, b: { rep: 3 } } }, b: { insDel: 10, r: { a: { rep: 3 }, b: { rep: 3 } } } }}
        ${{ map: '(ab)', insDel: 3 }} | ${{ map: 'b' }}                          | ${{ a: { t: { b: { insDel: 3 } } }, b: {} }}
    `('splitMap $defA $defB', ({ defA, defB, expected }) => {
        const tAB = addWeightedDefMapToTrie(defA);
        addWeightedDefMapToTrie(defB, tAB);
        expect(tAB).toEqual(expected);

        const tBA = addWeightedDefMapToTrie(defA);
        addWeightedDefMapToTrie(defB, tBA);
        expect(tBA).toEqual(expected);
    });
});
