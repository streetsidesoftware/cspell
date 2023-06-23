import { describe, expect, test } from 'vitest';

import type { CostPosition } from '../distance/weightedMaps.js';
import { createWeightCostCalculator } from '../distance/weightedMaps.js';
import type { DictionaryInformation } from '../models/DictionaryInformation.js';
import { mapDictionaryInformationToWeightMap } from './mapDictionaryInfoToWeightMap.js';

describe('mapDictionaryInfoToWeightMap', () => {
    test.each`
        dictInfo                                                                  | pos                            | expected
        ${di({})}                                                                 | ${{}}                          | ${[]}
        ${di({ alphabet: 'ac-z' })}                                               | ${{ a: 'apple', b: 'banana' }} | ${[]}
        ${di({ alphabet: 'a-zA-B' })}                                             | ${{ a: 'apple', b: 'banana' }} | ${[cp({ a: 'apple', b: 'banana', ai: 1, bi: 1, c: 100 })]}
        ${di({ hunspellInformation: { aff: 'TRY abc\n' } })}                      | ${{ a: 'apple', b: 'banana' }} | ${[cp({ a: 'apple', b: 'banana', ai: 1, bi: 1, c: 100 })]}
        ${di({ suggestionEditCosts: [{ map: 'abc', replace: 50, penalty: 2 }] })} | ${{ a: 'apple', b: 'banana' }} | ${[cp({ a: 'apple', b: 'banana', ai: 1, bi: 1, c: 50, p: 2 })]}
    `('dictionaryInformationToWeightMap $dictInfo $pos', ({ dictInfo, pos, expected }) => {
        const wm = createWeightCostCalculator(mapDictionaryInformationToWeightMap(dictInfo));
        const costPos = cp(pos);
        const r = [...wm.calcReplaceCosts(costPos)];
        expect(r).toEqual(expected);
    });
});

function cp(initial: Partial<CostPosition>, ...rest: Partial<CostPosition>[]): CostPosition {
    let s = { ...initial };
    for (const u of rest) {
        s = { ...s, ...u };
    }

    const { a = '', b = '', ai = 0, bi = 0, c = 0, p = 0 } = s;

    return { a, b, ai, bi, c, p };
}

function di(dictInfo: Partial<DictionaryInformation>): DictionaryInformation {
    return dictInfo;
}
