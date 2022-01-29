import type { SuggestionCostMapDef } from '../models/suggestionCostsDef';
import {
    addDefToWeightMap,
    CostPosition,
    createWeightMap,
    lookupReplaceCost,
    prettyPrintWeightMap,
    __testing__,
} from './weightedMaps';

const { splitMapSubstrings, splitMap, findTrieCostPrefixes } = __testing__;

// const u = undefined;  cspell:

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
        map                 | expected
        ${''}               | ${[]}
        ${'||'}             | ${[]}
        ${'abc'}            | ${['abc'.split('')]}
        ${'abc|'}           | ${['abc'.split('')]}
        ${'f(ph)(gh)v|eé'}  | ${[['f', 'ph', 'gh', 'v'], ['e', 'é', 'é'.normalize('NFD')]]}
        ${'f(ph)(😁)🤣|eé'} | ${[['f', 'ph', '😁', '🤣'], ['e', 'é', 'é'.normalize('NFD')]]}
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
        defs                                                                    | word      | offset | expected
        ${[]}                                                                   | ${''}     | ${1}   | ${[]}
        ${[defIns('aeiou', 7, penalty(5)), defIns('(ae)(ea)(ou)(ei)(ie)', 11)]} | ${'read'} | ${1}   | ${[{ i: 2, c: 7, p: 5 }, { i: 3, c: 11, p: 0 }] /* cspell:disable-line */}
        ${[defIns('aeiou', 7, penalty(5)), defIns('(ae)(ea)(ou)(ei)(ie)', 11)]} | ${'read'} | ${2}   | ${[{ i: 3, c: 7, p: 5 }] /* cspell:disable-line */}
    `('findTrieCostPrefixes with insDel $defs.0 $defs.1 $word $offset', ({ defs, word, offset, expected }) => {
        const map = createWeightMap(...defs);
        expect([...findTrieCostPrefixes(map.insDel, word, offset)]).toEqual(expected);
    });

    // cspell:ignore aeiou
    test.each`
        defs                                                        | wordA     | ai   | wordB      | bi   | expected
        ${[]}                                                       | ${''}     | ${1} | ${''}      | ${0} | ${[]}
        ${[defIns('aeiou', 7), defIns('(ae)(ea)(ou)(ei)(ie)', 11)]} | ${'read'} | ${1} | ${''}      | ${0} | ${[{ ai: 2, bi: 0, c: 1007, p: 1000 }, { ai: 3, bi: 0, c: 1011, p: 1000 }]}
        ${[defIns('aeiou', 7), defIns('(ae)(ea)(ou)(ei)(ie)', 11)]} | ${'read'} | ${1} | ${'ride'}  | ${1} | ${[{ ai: 2, bi: 1, c: 1007 /* del e */, p: 1000 }, { ai: 3, bi: 1, c: 1011 /* del ea */, p: 1000 }, { ai: 1, bi: 2, c: 1007 /* ins i */, p: 1000 }]}
        ${[defIns('aeiou', 7), defIns('(ae)(ea)(ou)(ei)(ie)', 11)]} | ${'red'}  | ${1} | ${'read'}  | ${1} | ${[{ ai: 2, bi: 1, c: 1007 /* del e */, p: 1000 }, { ai: 1, bi: 2, c: 1007 /* ins */, p: 1000 }, { ai: 1, bi: 3, c: 1011 /* ins ea */, p: 1000 }]}
        ${[defIns('aeiou', 7), defIns('(ae)(ea)(ou)(ei)(ie)', 11)]} | ${'red'}  | ${2} | ${'read'}  | ${2} | ${[{ ai: 2, bi: 3, c: 1007 /* ins a */, p: 1000 }]}
        ${[defIns('1234567890', 7, penalty(20))]}                   | ${'cost'} | ${4} | ${'cost8'} | ${4} | ${[{ ai: 4, bi: 5, c: 1007 /* insert 8 */, p: 1020 }]}
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
            const results = [...map.calcInsDelCosts({ a: wordA, b: wordB, ai, bi, c: 1000, p: 1000 })];
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
        ${[defRep('aeiou', 5), defRep('ae(ae)(ea)', 7)]}    | ${'read'}    | ${1} | ${'red'}     | ${1} | ${[{ ai: 3, bi: 2, c: 1007 /* ea -> a */, p: 1000 }]}
        ${[defRep('aeiou', 5), defRep('ae(ae)(ea)', 7)]}    | ${'read'}    | ${1} | ${'road'}    | ${1} | ${[{ ai: 2, bi: 2, c: 1005 /* e -> o */, p: 1000 }]}
        ${[defRep('aeiou', 5), defRep('o(oo)|e(ee)', 7)]}   | ${'met'}     | ${1} | ${'meet'}    | ${1} | ${[{ ai: 2, bi: 3, c: 1007 /* e -> ee */, p: 1000 }]}
        ${[defRep('aeiou', 5), defRep('o(oo)|e(ee)', 7)]}   | ${'meet'}    | ${1} | ${'met'}     | ${1} | ${[{ ai: 3, bi: 2, c: 1007 /* ee -> e */, p: 1000 }]}
        ${[defRep('aeiou', 5), defRep('(ei)(ie)', 7)]}      | ${'believe'} | ${3} | ${'receive'} | ${3} | ${[{ ai: 4, bi: 4, c: 1005 /* i => e */, p: 1000 }, { ai: 5, bi: 5, c: 1007 /* ie => ei */, p: 1000 }]}
        ${[defRep('(sk)(sch)', 5), defRep('(sch)(sk)', 7)]} | ${'school'}  | ${0} | ${'skull'}   | ${0} | ${[{ ai: 3, bi: 2, c: 1005 /* sch => sk */, p: 1000 }]}
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
            const results = [...map.calcReplaceCosts({ a: wordA, b: wordB, ai, bi, c: 1000, p: 1000 })];
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
        ${[defSwap('ae', 9), defSwap('ei', 7)]} | ${'believe'} | ${3} | ${'receive'} | ${3} | ${[{ ai: 5, bi: 5, c: 1007 /* swap ei -> ie */, p: 1000 }]}
        ${[defSwap('ei', 7, penalty(20))]}      | ${'believe'} | ${3} | ${'receive'} | ${3} | ${[{ ai: 5, bi: 5, c: 1007 /* swap ei -> ie */, p: 1020 }]}
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
            const results = [...map.calcSwapCosts({ a: wordA, b: wordB, ai, bi, c: 1000, p: 1000 })];
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

// function mo(...opts: Partial<SuggestionCostMapDef>[]): Partial<SuggestionCostMapDef> {
//     return mergeOps(opts);
// }

function penalty(penalty: number): Partial<SuggestionCostMapDef> {
    return { penalty };
}

function defIns(map: string, insDel: number, ...opts: Partial<SuggestionCostMapDef>[]): SuggestionCostMapDef {
    return { ...mergeOps(opts), map, insDel };
}

function defRep(map: string, replace: number, ...opts: Partial<SuggestionCostMapDef>[]): SuggestionCostMapDef {
    return { ...mergeOps(opts), map, replace };
}

function defSwap(map: string, swap: number, ...opts: Partial<SuggestionCostMapDef>[]): SuggestionCostMapDef {
    return { ...mergeOps(opts), map, swap };
}

function mergeOps(opts: Partial<SuggestionCostMapDef>[]): Partial<SuggestionCostMapDef> {
    return opts.reduce((acc, opt) => ({ ...acc, ...opt }), {} as Partial<SuggestionCostMapDef>);
}
