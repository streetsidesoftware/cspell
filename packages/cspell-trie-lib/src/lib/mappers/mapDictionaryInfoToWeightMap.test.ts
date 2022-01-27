import { CostPosition } from '../distance/weightedMaps';
import type { DictionaryInformation, HunspellCosts, HunspellInformation } from '../models/DictionaryInformation';
import {
    hunspellInformationToSuggestionCostDef,
    mapDictionaryInformationToWeightMap,
    __testing__,
} from './mapDictionaryInfoToWeightMap';

// cspell:ignore conv OCONV
const { affMap, affRepConv, affNoTry, affTry, affKey, affTryFirstCharacterReplace, calcCosts, affMapCaps, affKeyCaps } =
    __testing__;

const sampleAff = `
# comment.
# cspell:ignore eéèëê iíìïî
TRY abc

MAP 3
MAP eéèëê
MAP aáà
MAP iíìïî

OCONV 2
OCONV ĳ ij
OCONV Ĳ IJ

ICONV 9
ICONV áá aa
ICONV éé ee
ICONV íé ie
ICONV óó oo
ICONV úú uu
ICONV óé oe
ICONV ’ '
ICONV ij ĳ
ICONV IJ Ĳ

REP ^ß ss

NO-TRY -1234567890

# cspell:ignore asdfghjkl qwertyuiop zxcvbnm
KEY qwertyuiop|asdfghjkl|zxcvbnm
`;

describe('mapAffToWeightMap', () => {
    // cspell:ignore aàâä
    test.each`
        line                  | costs             | expected
        ${''}                 | ${{}}             | ${undefined}
        ${'MAP aàâäAÀÂÄ'}     | ${{}}             | ${{ map: 'aàâäAÀÂÄ', replace: 25, swap: 25 }}
        ${'MAP 😁😀😊😂🤣😬'} | ${{}}             | ${{ map: '😁😀😊😂🤣😬', replace: 25, swap: 25 }}
        ${'MAP aàâäAÀÂÄ'}     | ${{ mapCost: 1 }} | ${{ map: 'aàâäAÀÂÄ', replace: 1, swap: 1 }}
    `('affMap "$line" $costs', ({ line, costs, expected }) => {
        expect(affMap(line, calcCosts(costs))).toEqual(expected);
    });

    test.each`
        line                  | costs                  | expected
        ${''}                 | ${{}}                  | ${undefined}
        ${'MAP aàâäAÀÂÄ'}     | ${{}}                  | ${{ map: 'aA|àÀ|âÂ|äÄ|Aa|Àà|Ââ|Ää', replace: 1 }}
        ${'MAP 😁😀😊😂🤣😬'} | ${{}}                  | ${undefined}
        ${'MAP aàâäAÀÂÄ'}     | ${c({ capsCosts: 2 })} | ${{ map: 'aA|àÀ|âÂ|äÄ|Aa|Àà|Ââ|Ää', replace: 2 }}
    `('affMapCaps "$line" $costs', ({ line, costs, expected }) => {
        expect(affMapCaps(line, calcCosts(costs))).toEqual(expected);
    });

    test.each`
        line                 | costs                            | expected
        ${''}                | ${{}}                            | ${undefined}
        ${'MAP aàâäAÀÂÄ'}    | ${{}}                            | ${undefined}
        ${'NO-TRY aàâäAÀÂÄ'} | ${{}}                            | ${undefined}
        ${'TRY abc'}         | ${c({ mapCost: 1 })}             | ${{ map: 'abc', replace: 95, insDel: 95, swap: 95 }}
        ${'TRY abc'}         | ${c({ tryCharCost: 90 })}        | ${{ map: 'abc', replace: 90, insDel: 90, swap: 90 }}
        ${'TRY abc'}         | ${c({ firstLetterPenalty: 10 })} | ${{ map: 'abc', replace: 95, insDel: 95, swap: 95 }}
    `('affTry "$line" $costs', ({ line, costs, expected }) => {
        expect(affTry(line, calcCosts(costs))).toEqual(expected);
    });

    test.each`
        line              | costs                            | expected
        ${''}             | ${{}}                            | ${undefined}
        ${'MAP aàâäAÀÂÄ'} | ${{}}                            | ${undefined}
        ${'TRY aàâäAÀÂÄ'} | ${{}}                            | ${undefined}
        ${'NO-TRY abc'}   | ${c({ mapCost: 1 })}             | ${{ map: 'abc', insDel: 5, penalty: 195 }}
        ${'NO-TRY abc'}   | ${c({ tryCharCost: 90 })}        | ${{ map: 'abc', insDel: 10, penalty: 190 }}
        ${'NO-TRY abc'}   | ${c({ firstLetterPenalty: 10 })} | ${{ map: 'abc', insDel: 5, penalty: 195 }}
    `('affNoTry "$line" $costs', ({ line, costs, expected }) => {
        expect(affNoTry(line, calcCosts(costs))).toEqual(expected);
    });

    test.each`
        line              | costs                            | expected
        ${''}             | ${{}}                            | ${undefined}
        ${'MAP aàâäAÀÂÄ'} | ${{}}                            | ${undefined}
        ${'TRY abc'}      | ${c({ mapCost: 1 })}             | ${{ map: '(^a)(^b)(^c)', replace: 91, penalty: 4 }}
        ${'TRY abc'}      | ${c({ tryCharCost: 90 })}        | ${{ map: '(^a)(^b)(^c)', replace: 86, penalty: 4 }}
        ${'TRY abc'}      | ${c({ firstLetterPenalty: 10 })} | ${{ map: '(^a)(^b)(^c)', replace: 85, penalty: 10 }}
    `('affTryFirstCharacterReplace "$line" $costs', ({ line, costs, expected }) => {
        expect(affTryFirstCharacterReplace(line, calcCosts(costs))).toEqual(expected);
    });

    // cspell:ignore qwer zxcv
    test.each`
        line                          | costs                      | expected
        ${''}                         | ${{}}                      | ${undefined}
        ${'MAP aàâäAÀÂÄ'}             | ${{}}                      | ${undefined}
        ${'KEY qwer|asdf|zxcv'}       | ${c({ mapCost: 1 })}       | ${{ map: 'qw|we|er|as|sd|df|zx|xc|cv|QW|WE|ER|AS|SD|DF|ZX|XC|CV', replace: 94, swap: 94 }}
        ${'KEY qwer|a|asdf|zxcv'}     | ${c({ keyboardCost: 74 })} | ${{ map: 'qw|we|er|as|sd|df|zx|xc|cv|QW|WE|ER|AS|SD|DF|ZX|XC|CV', replace: 74, swap: 74 }}
        ${'KEY qwer春😁|a|asdf|zxcv'} | ${c()}                     | ${{ map: 'qw|we|er|r春|春(😁)|as|sd|df|zx|xc|cv|QW|WE|ER|R春|AS|SD|DF|ZX|XC|CV', replace: 94, swap: 94 }}
        ${'KEY a😁b'}                 | ${c()}                     | ${{ map: 'a(😁)|(😁)b|A(😁)|(😁)B', replace: 94, swap: 94 }}
    `('affKey "$line" $costs', ({ line, costs, expected }) => {
        expect(affKey(line, calcCosts(costs))).toEqual(expected);
    });

    // cspell:ignore qwer zxcv
    test.each`
        line                          | costs                      | expected
        ${''}                         | ${{}}                      | ${undefined}
        ${'MAP aàâäAÀÂÄ'}             | ${{}}                      | ${undefined}
        ${'KEY qwer|a|asdf|zxcv'}     | ${c({ keyboardCost: 74 })} | ${{ map: 'qQ|wW|eE|rR|aA|sS|dD|fF|zZ|xX|cC|vV', replace: 1 }}
        ${'KEY qwer|a|asdf|zxcv'}     | ${c({ capsCosts: 2 })}     | ${{ map: 'qQ|wW|eE|rR|aA|sS|dD|fF|zZ|xX|cC|vV', replace: 2 }}
        ${'KEY qwer春😁|a|asdf|zxcv'} | ${c()}                     | ${{ map: 'qQ|wW|eE|rR|aA|sS|dD|fF|zZ|xX|cC|vV', replace: 1 }}
        ${'KEY a😁b'}                 | ${c()}                     | ${{ map: 'aA|bB', replace: 1 }}
    `('affKeyCaps "$line" $costs', ({ line, costs, expected }) => {
        expect(affKeyCaps(line, calcCosts(costs))).toEqual(expected);
    });

    test.each`
        line              | costs                    | expected
        ${''}             | ${{}}                    | ${undefined}
        ${'REP o oo'}     | ${{}}                    | ${{ map: '(o)(oo)', replace: 75 }}
        ${'REP ^a A'}     | ${{ mapCost: 1 }}        | ${{ map: '(^a)(^A)', replace: 75 }}
        ${'REP $ en$'}    | ${{ replaceCosts: 55 }}  | ${{ map: '($)(en$)', replace: 55 }}
        ${'REP ^af$ aff'} | ${{}}                    | ${{ map: '(^af$)(^aff$)', replace: 75 }}
        ${'REP ß ss'}     | ${{}}                    | ${{ map: '(ß)(ss)', replace: 75 }}
        ${'REP ß 0'}      | ${{}}                    | ${{ map: '(ß)()', replace: 75 }}
        ${'REP 25'}       | ${{}}                    | ${undefined}
        ${'ICONV 25'}     | ${{}}                    | ${undefined}
        ${'OCONV 25'}     | ${{}}                    | ${undefined}
        ${'ICONV áá aa'}  | ${{}}                    | ${{ map: '(áá)(aa)', replace: 30 }}
        ${'OCONV ss ß'}   | ${{ replaceCosts: 55 }}  | ${{ map: '(ss)(ß)', replace: 30 }}
        ${'OCONV ss ß'}   | ${{ ioConvertCost: 25 }} | ${{ map: '(ss)(ß)', replace: 25 }}
    `('affRepConv "$line" $costs', ({ line, costs, expected }) => {
        expect(affRepConv(line, calcCosts(costs))).toEqual(expected);
    });

    const AFFs: [string, HunspellCosts | undefined][] = [
        ['', undefined],
        [
            `
            TRY abc
            `,
            undefined,
        ],
        [sampleAff, undefined],
    ];

    test.each(AFFs)('hunspellInformationToSuggestionCostDef <%s>', (aff, costs) => {
        const info: HunspellInformation = { aff };
        if (costs) {
            info.costs = costs;
        }
        const defs = hunspellInformationToSuggestionCostDef(info, undefined);
        expect(defs).toMatchSnapshot();
    });

    test.each`
        dictInfo                                                                  | pos                            | expected
        ${di({})}                                                                 | ${{}}                          | ${[]}
        ${di({})}                                                                 | ${{ a: 'apple', b: 'banana' }} | ${[]}
        ${di({ hunspellInformation: { aff: 'TRY abc\n' } })}                      | ${{ a: 'apple', b: 'banana' }} | ${[cp({ a: 'apple', b: 'banana', ai: 1, bi: 1, c: 95 })]}
        ${di({ suggestionEditCosts: [{ map: 'abc', replace: 50, penalty: 2 }] })} | ${{ a: 'apple', b: 'banana' }} | ${[cp({ a: 'apple', b: 'banana', ai: 1, bi: 1, c: 50, p: 2 })]}
    `('dictionaryInformationToWeightMap $dictInfo $pos', ({ dictInfo, pos, expected }) => {
        const wm = mapDictionaryInformationToWeightMap(dictInfo);
        const costPos = cp(pos);
        const r = [...wm.calcReplaceCosts(costPos)];
        expect(r).toEqual(expected);
    });
});

function c(hc: HunspellCosts = {}): HunspellCosts {
    return hc;
}

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
