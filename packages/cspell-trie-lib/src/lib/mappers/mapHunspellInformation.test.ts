import type { HunspellCosts, HunspellInformation } from '../models/DictionaryInformation';
import { hunspellInformationToSuggestionCostDef, __testing__ } from './mapHunspellInformation';

// cspell:ignore conv OCONV
const {
    affMap,
    affRepConv,
    affNoTry,
    affTry,
    affKey,
    affTryFirstCharacterReplace,
    calcCosts,
    affMapCaps,
    affKeyCaps,
    affTryAccents,
    affMapAccents,
} = __testing__;

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

describe('mapHunspellInformation', () => {
    // cspell:ignore aàâä
    test.each`
        line                  | costs             | expected
        ${''}                 | ${{}}             | ${undefined}
        ${'MAP aàâäAÀÂÄ'}     | ${{}}             | ${{ map: 'aàâäAÀÂÄ', replace: 25, swap: 25 }}
        ${'MAP 😁😀😊😂🤣😬'} | ${{}}             | ${{ map: '😁😀😊😂🤣😬', replace: 25, swap: 25 }}
        ${'MAP aàâäAÀÂÄ'}     | ${{ mapCost: 1 }} | ${{ map: 'aàâäAÀÂÄ', replace: 1, swap: 1 }}
        ${'MAP ß(ss)'}        | ${{}}             | ${{ map: 'ß(ss)', replace: 25, swap: 25 }}
    `('affMap "$line" $costs', ({ line, costs, expected }) => {
        expect(affMap(line, calcCosts(costs))).toEqual(expected);
    });

    test.each`
        line                  | costs                  | expected
        ${''}                 | ${{}}                  | ${undefined}
        ${'MAP aàâäAÀÂÄ'}     | ${{}}                  | ${{ map: 'aA|àÀ|âÂ|äÄ|Aa|Àà|Ââ|Ää', replace: 1 }}
        ${'MAP 😁😀😊😂🤣😬'} | ${{}}                  | ${undefined}
        ${'MAP aàâäAÀÂÄ'}     | ${c({ capsCosts: 2 })} | ${{ map: 'aA|àÀ|âÂ|äÄ|Aa|Àà|Ââ|Ää', replace: 2 }}
        ${'MAP ß(ss)'}        | ${{}}                  | ${{ map: 'ß(SS)(ss)|(ss)(SS)', replace: 1 }}
    `('affMapCaps "$line" $costs', ({ line, costs, expected }) => {
        expect(affMapCaps(line, calcCosts(costs))).toEqual(expected);
    });

    test.each`
        line                  | costs                    | expected
        ${''}                 | ${{}}                    | ${undefined}
        ${'MAP 😁😀😊😂🤣😬'} | ${{}}                    | ${[]}
        ${'MAP aàâäAÀÂÄ'}     | ${{}}                    | ${[{ map: 'a(à)à|A(À)À|a(â)â|A(Â)Â|a(ä)ä|A(Ä)Ä', replace: 1 }, { map: '(à)à|(À)À|(â)â|(Â)Â|(ä)ä|(Ä)Ä|(À)À|(à)à|(Â)Â|(â)â|(Ä)Ä|(ä)ä', replace: 0 }]}
        ${'MAP aàâäAÀÂÄ'}     | ${c({ accentCosts: 2 })} | ${[{ map: 'a(à)à|A(À)À|a(â)â|A(Â)Â|a(ä)ä|A(Ä)Ä', replace: 2 }, { map: '(à)à|(À)À|(â)â|(Â)Â|(ä)ä|(Ä)Ä|(À)À|(à)à|(Â)Â|(â)â|(Ä)Ä|(ä)ä', replace: 0 }]}
        ${'MAP ß(ss)'}        | ${{}}                    | ${[]}
    `('affMapCaps "$line" $costs', ({ line, costs, expected }) => {
        expect(affMapAccents(line, calcCosts(costs))).toEqual(expected);
    });

    test.each`
        line                 | costs                            | expected
        ${''}                | ${{}}                            | ${undefined}
        ${'MAP aàâäAÀÂÄ'}    | ${{}}                            | ${undefined}
        ${'NO-TRY aàâäAÀÂÄ'} | ${{}}                            | ${undefined}
        ${'TRY abc'}         | ${c({ mapCost: 1 })}             | ${[{ map: 'ABCabc', replace: 100, insDel: 100, swap: 100 }, { map: 'Aa|Bb|Cc', replace: 1 }]}
        ${'TRY abc'}         | ${c({ tryCharCost: 90 })}        | ${[{ map: 'ABCabc', replace: 90, insDel: 90, swap: 90 }, { map: 'Aa|Bb|Cc', replace: 1 }]}
        ${'TRY abc'}         | ${c({ firstLetterPenalty: 10 })} | ${[{ map: 'ABCabc', replace: 100, insDel: 100, swap: 100 }, { map: 'Aa|Bb|Cc', replace: 1 }]}
    `('affTry "$line" $costs', ({ line, costs, expected }) => {
        expect(affTry(line, calcCosts(costs))).toEqual(expected);
    });

    test.each`
        line              | costs                            | expected
        ${''}             | ${{}}                            | ${undefined}
        ${'MAP aàâäAÀÂÄ'} | ${{}}                            | ${undefined}
        ${'TRY aàâäAÀÂÄ'} | ${{}}                            | ${undefined}
        ${'NO-TRY abc'}   | ${c({ mapCost: 1 })}             | ${{ map: 'abc', insDel: 10, penalty: 210 }}
        ${'NO-TRY abc'}   | ${c({ tryCharCost: 90 })}        | ${{ map: 'abc', insDel: 20, penalty: 200 }}
        ${'NO-TRY abc'}   | ${c({ firstLetterPenalty: 10 })} | ${{ map: 'abc', insDel: 10, penalty: 210 }}
    `('affNoTry "$line" $costs', ({ line, costs, expected }) => {
        expect(affNoTry(line, calcCosts(costs))).toEqual(expected);
    });

    test.each`
        line              | costs                            | expected
        ${''}             | ${{}}                            | ${undefined}
        ${'MAP aàâäAÀÂÄ'} | ${{}}                            | ${undefined}
        ${'TRY abc'}      | ${c({ mapCost: 1 })}             | ${{ map: '(^a)(^b)(^c)(^)', replace: 96, penalty: 8 }}
        ${'TRY abc'}      | ${c({ tryCharCost: 90 })}        | ${{ map: '(^a)(^b)(^c)(^)', replace: 86, penalty: 8 }}
        ${'TRY abc'}      | ${c({ firstLetterPenalty: 10 })} | ${{ map: '(^a)(^b)(^c)(^)', replace: 90, penalty: 20 }}
    `('affTryFirstCharacterReplace "$line" $costs', ({ line, costs, expected }) => {
        expect(affTryFirstCharacterReplace(line, calcCosts(costs))).toEqual(expected);
    });

    // cspell:ignore qwer zxcv
    test.each`
        line                          | costs                      | expected
        ${''}                         | ${{}}                      | ${undefined}
        ${'MAP aàâäAÀÂÄ'}             | ${{}}                      | ${undefined}
        ${'KEY qwer|asdf|zxcv'}       | ${c({ mapCost: 1 })}       | ${{ map: 'qw|we|er|as|sd|df|zx|xc|cv|QW|WE|ER|AS|SD|DF|ZX|XC|CV', replace: 99, swap: 99 }}
        ${'KEY qwer|a|asdf|zxcv'}     | ${c({ keyboardCost: 74 })} | ${{ map: 'qw|we|er|as|sd|df|zx|xc|cv|QW|WE|ER|AS|SD|DF|ZX|XC|CV', replace: 74, swap: 74 }}
        ${'KEY qwer春😁|a|asdf|zxcv'} | ${c()}                     | ${{ map: 'qw|we|er|r春|春(😁)|as|sd|df|zx|xc|cv|QW|WE|ER|R春|AS|SD|DF|ZX|XC|CV', replace: 99, swap: 99 }}
        ${'KEY a😁b'}                 | ${c()}                     | ${{ map: 'a(😁)|(😁)b|A(😁)|(😁)B', replace: 99, swap: 99 }}
    `('affKey "$line" $costs', ({ line, costs, expected }) => {
        expect(affKey(line, calcCosts(costs))).toEqual(expected);
    });

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

    // cspell:ignore qwér aasdfzxcv abcdéefghi
    test.each`
        line                    | costs                      | expected
        ${''}                   | ${{}}                      | ${undefined}
        ${'MAP aàâäAÀÂÄ'}       | ${{}}                      | ${undefined}
        ${'TRY abcdéefghi'}     | ${c({ keyboardCost: 74 })} | ${[{ map: 'e(é)é|E(É)É', replace: 1 }, { map: '(é)é|(É)É', replace: 0 }]}
        ${'TRY abcdéefghi'}     | ${c({ accentCosts: 33 })}  | ${[{ map: 'e(é)é|E(É)É', replace: 33 }, { map: '(é)é|(É)É', replace: 0 }]}
        ${'TRY 春😁|aasdfzxcv'} | ${c()}                     | ${[]}
        ${'TRY a😁b'}           | ${c()}                     | ${[]}
    `('affTryAccents "$line" $costs', ({ line, costs, expected }) => {
        expect(affTryAccents(line, calcCosts(costs))).toEqual(expected);
    });

    test.each`
        line              | costs                    | expected
        ${''}             | ${{}}                    | ${undefined}
        ${'REP o oo'}     | ${{}}                    | ${{ map: 'o(oo)', replace: 75 }}
        ${'REP ^a A'}     | ${{ mapCost: 1 }}        | ${{ map: '(^a)(^A)', replace: 75 }}
        ${'REP $ en$'}    | ${{ replaceCosts: 55 }}  | ${{ map: '$(en$)', replace: 55 }}
        ${'REP ^af$ aff'} | ${{}}                    | ${{ map: '(^af$)(^aff$)', replace: 75 }}
        ${'REP ß ss'}     | ${{}}                    | ${{ map: 'ß(ss)', replace: 75 }}
        ${'REP ß 0'}      | ${{}}                    | ${{ map: 'ß()', replace: 75 }}
        ${'REP 25'}       | ${{}}                    | ${undefined}
        ${'ICONV 25'}     | ${{}}                    | ${undefined}
        ${'OCONV 25'}     | ${{}}                    | ${undefined}
        ${'ICONV áá aa'}  | ${{}}                    | ${{ map: '(áá)(aa)', replace: 30 }}
        ${'OCONV ss ß'}   | ${{ replaceCosts: 55 }}  | ${{ map: '(ss)ß', replace: 30 }}
        ${'OCONV ss ß'}   | ${{ ioConvertCost: 25 }} | ${{ map: '(ss)ß', replace: 25 }}
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
});

function c(hc: HunspellCosts = {}): HunspellCosts {
    return hc;
}
