import type { SuggestionCostMapDef } from './suggestionCostsDef';
import { addDefToWeightMap, CostPosition, lookupReplaceCost, prettyPrintWeightMap } from './weightedMaps';
import { createWeightMap, __testing__ } from './weightedMaps';

const { splitMapSubstrings, splitMap, findTrieCostPrefixes } = __testing__;

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
        ${''}              | ${[]}
        ${'||'}            | ${[]}
        ${'abc'}           | ${['abc'.split('')]}
        ${'abc|'}          | ${['abc'.split('')]}
        ${'f(ph)(gh)v|eé'} | ${[['f', 'ph', 'gh', 'v'], ['e', 'é']]}
    `('splitMap "$map"', ({ map, expected }) => {
        expect(splitMap({ map })).toEqual(expected);
    });

    test.each`
        defs                                  | expected
        ${[]}                                 | ${{ insDel: {}, replace: {}, swap: {} }}
        ${[defIns('ab', 3)]}                  | ${{ insDel: { n: { a: { c: 3 }, b: { c: 3 } } }, replace: {}, swap: {} }}
        ${[defIns('ab', 3), defIns('bc', 2)]} | ${{ insDel: { n: { a: { c: 3 }, b: { c: 2 }, c: { c: 2 } } }, replace: {}, swap: {} }}
        ${[defRep('ab', 3)]}                  | ${{ insDel: {}, replace: { n: { a: { t: { n: { b: { c: 3 } } } }, b: { t: { n: { a: { c: 3 } } } } } }, swap: {} }}
        ${[defSwap('ab', 3)]}                 | ${{ insDel: {}, replace: {}, swap: { n: { a: { t: { n: { b: { c: 3 } } } }, b: { t: { n: { a: { c: 3 } } } } } } }}
    `('buildWeightMap $defs', ({ defs, expected }) => {
        expect(createWeightMap(...defs)).toEqual(expected);
    });

    test.each`
        def1                                               | def2                                       | def3
        ${undefined}                                       | ${undefined}                               | ${undefined}
        ${defIns('ab', 3)}                                 | ${undefined}                               | ${undefined}
        ${defIns('ab', 3)}                                 | ${defIns('bc', 2)}                         | ${undefined}
        ${defRep('ab', 3)}                                 | ${undefined}                               | ${undefined}
        ${defSwap('ab', 3)}                                | ${undefined}                               | ${undefined}
        ${defRep('(ei)(ie)', 3)}                           | ${undefined}                               | ${undefined}
        ${defRep('(ei)(ie)e', 3, { insDel: 11, swap: 4 })} | ${{ map: 'aeiou', replace: 4, insDel: 7 }} | ${defRep('eio', 1, { swap: 3 })}
    `('buildWeightMap pp $def1, $def2, $def2', ({ def1, def2, def3 }) => {
        const defs = [def1, def2, def3].filter((a) => !!a);
        const pp = prettyPrintWeightMap(createWeightMap(...defs));
        expect(pp).toMatchSnapshot();

        const map2 = defs.reverse().reduce((map, def) => addDefToWeightMap(map, def), createWeightMap());
        expect(prettyPrintWeightMap(map2)).toBe(pp);
    });

    test.each`
        defs                                                        | word      | offset | expected
        ${[]}                                                       | ${''}     | ${1}   | ${[]}
        ${[defIns('aeiou', 7), defIns('(ae)(ea)(ou)(ei)(ie)', 11)]} | ${'read'} | ${1}   | ${[{ i: 2, c: 7 }, { i: 3, c: 11 }] /* cspell:disable-line */}
        ${[defIns('aeiou', 7), defIns('(ae)(ea)(ou)(ei)(ie)', 11)]} | ${'read'} | ${2}   | ${[{ i: 3, c: 7 }] /* cspell:disable-line */}
    `('findTrieCostPrefixes with insDel $defs.0 $defs.1 $word $offset', ({ defs, word, offset, expected }) => {
        const map = createWeightMap(...defs);
        expect([...findTrieCostPrefixes(map.insDel, word, offset)]).toEqual(expected);
    });

    // cspell:ignore aeiou
    test.each`
        defs                                                        | wordA     | ai   | wordB     | bi   | expected
        ${[]}                                                       | ${''}     | ${1} | ${''}     | ${0} | ${[]}
        ${[defIns('aeiou', 7), defIns('(ae)(ea)(ou)(ei)(ie)', 11)]} | ${'read'} | ${1} | ${''}     | ${0} | ${[{ ai: 2, bi: 0, c: 1007 }, { ai: 3, bi: 0, c: 1011 }]}
        ${[defIns('aeiou', 7), defIns('(ae)(ea)(ou)(ei)(ie)', 11)]} | ${'read'} | ${1} | ${'ride'} | ${1} | ${[{ ai: 2, bi: 1, c: 1007 /* del e */ }, { ai: 3, bi: 1, c: 1011 /* del ea */ }, { ai: 1, bi: 2, c: 1007 /* ins i */ }]}
        ${[defIns('aeiou', 7), defIns('(ae)(ea)(ou)(ei)(ie)', 11)]} | ${'red'}  | ${1} | ${'read'} | ${1} | ${[{ ai: 2, bi: 1, c: 1007 /* del e */ }, { ai: 1, bi: 2, c: 1007 /* ins */ }, { ai: 1, bi: 3, c: 1011 /* ins ea */ }]}
        ${[defIns('aeiou', 7), defIns('(ae)(ea)(ou)(ei)(ie)', 11)]} | ${'red'}  | ${2} | ${'read'} | ${2} | ${[{ ai: 2, bi: 3, c: 1007 /* ins a */ }]}
    `(
        'calcInsDelCosts with $defs.0 $defs.1 "$wordA"@$ai, "$wordB"@$bi',
        ({
            defs,
            wordA,
            ai,
            wordB,
            bi,
            expected,
        }: {
            defs: SuggestionCostMapDef[];
            wordA: string;
            wordB: string;
            ai: number;
            bi: number;
            expected: CostPosition[];
        }) => {
            const map = createWeightMap(...defs);
            const results = [...map.calcInsDelCosts({ a: wordA, b: wordB, ai, bi, c: 1000 })];
            expected.forEach((p) => {
                (p.a = p.a ?? wordA), (p.b = p.b ?? wordB);
            });
            expect(results).toEqual(expect.arrayContaining(expected));
            expect(results).toHaveLength(expected.length);
        }
    );

    test.each`
        defs                                                | wordA        | ai   | wordB        | bi   | expected
        ${[]}                                               | ${''}        | ${0} | ${''}        | ${0} | ${[]}
        ${[defRep('aeiou', 5), defRep('ae(ae)(ea)', 7)]}    | ${'read'}    | ${1} | ${'red'}     | ${1} | ${[{ ai: 3, bi: 2, c: 1007 /* ea -> a */ }]}
        ${[defRep('aeiou', 5), defRep('ae(ae)(ea)', 7)]}    | ${'read'}    | ${1} | ${'road'}    | ${1} | ${[{ ai: 2, bi: 2, c: 1005 /* e -> o */ }]}
        ${[defRep('aeiou', 5), defRep('o(oo)|e(ee)', 7)]}   | ${'met'}     | ${1} | ${'meet'}    | ${1} | ${[{ ai: 2, bi: 3, c: 1007 /* e -> ee */ }]}
        ${[defRep('aeiou', 5), defRep('o(oo)|e(ee)', 7)]}   | ${'meet'}    | ${1} | ${'met'}     | ${1} | ${[{ ai: 3, bi: 2, c: 1007 /* ee -> e */ }]}
        ${[defRep('aeiou', 5), defRep('(ei)(ie)', 7)]}      | ${'believe'} | ${3} | ${'receive'} | ${3} | ${[{ ai: 4, bi: 4, c: 1005 /* i => e */ }, { ai: 5, bi: 5, c: 1007 /* ie => ei */ }]}
        ${[defRep('(sk)(sch)', 5), defRep('(sch)(sk)', 7)]} | ${'school'}  | ${0} | ${'skull'}   | ${0} | ${[{ ai: 3, bi: 2, c: 1005 /* sch => sk */ }]}
    `(
        'calcReplaceCosts with $defs.0 $defs.1 "$wordA"@$ai, "$wordB"@$bi',
        ({
            defs,
            wordA,
            ai,
            wordB,
            bi,
            expected,
        }: {
            defs: SuggestionCostMapDef[];
            wordA: string;
            wordB: string;
            ai: number;
            bi: number;
            expected: CostPosition[];
        }) => {
            const map = createWeightMap(...defs);
            const results = [...map.calcReplaceCosts({ a: wordA, b: wordB, ai, bi, c: 1000 })];
            expected.forEach((p) => {
                (p.a = p.a ?? wordA), (p.b = p.b ?? wordB);
            });
            expect(results).toEqual(expect.arrayContaining(expected));
            expect(results).toHaveLength(expected.length);
        }
    );

    test.each`
        defs                                    | wordA        | ai   | wordB        | bi   | expected
        ${[defSwap('ae', 9), defSwap('ei', 7)]} | ${'believe'} | ${1} | ${'receive'} | ${1} | ${[]}
        ${[defSwap('ae', 9), defSwap('ei', 7)]} | ${'believe'} | ${3} | ${'receive'} | ${3} | ${[{ ai: 5, bi: 5, c: 1007 /* swap ei -> ie */ }]}
    `(
        'calcSwapCosts with $defs.0 $defs.1 "$wordA"@$ai, "$wordB"@$bi',
        ({
            defs,
            wordA,
            ai,
            wordB,
            bi,
            expected,
        }: {
            defs: SuggestionCostMapDef[];
            wordA: string;
            wordB: string;
            ai: number;
            bi: number;
            expected: CostPosition[];
        }) => {
            const map = createWeightMap(...defs);
            const results = [...map.calcSwapCosts({ a: wordA, b: wordB, ai, bi, c: 1000 })];
            expected.forEach((p) => {
                (p.a = p.a ?? wordA), (p.b = p.b ?? wordB);
            });
            expect(results).toEqual(expect.arrayContaining(expected));
            expect(results).toHaveLength(expected.length);
        }
    );

    test.each`
        defs                                                 | wordA   | wordB   | expected
        ${[defRep('ae', 9), defRep('ei', 7)]}                | ${'a'}  | ${'e'}  | ${9}
        ${[defRep('ae', 9), defRep('ei', 7)]}                | ${'a'}  | ${'i'}  | ${undefined}
        ${[defRep('o(oo)(oh)', 9), defRep('o(oo)(ooo)', 7)]} | ${'oo'} | ${'o'}  | ${7}
        ${[defRep('o(oo)(oh)', 9), defRep('o(oo)(ooo)', 7)]} | ${'oo'} | ${'oh'} | ${9}
    `('calcSwapCosts with $defs.0 $defs.1 "$wordA", "$wordB"', ({ defs, wordA, wordB, expected }) => {
        const map = createWeightMap(...defs);
        const results = lookupReplaceCost(map, wordA, wordB);
        expect(results).toEqual(expected);
    });
});

function defIns(map: string, insDel: number, opt: Partial<SuggestionCostMapDef> = {}): SuggestionCostMapDef {
    return { ...opt, map, insDel };
}

function defRep(map: string, replace: number, opt: Partial<SuggestionCostMapDef> = {}): SuggestionCostMapDef {
    return { ...opt, map, replace };
}

function defSwap(map: string, swap: number, opt: Partial<SuggestionCostMapDef> = {}): SuggestionCostMapDef {
    return { ...opt, map, swap };
}
