import { describe, expect, test } from 'vitest';

import { mapDictionaryInformationToWeightMap } from '../mappers/mapDictionaryInfoToWeightMap.js';
import type { SuggestionCostMapDef } from '../models/suggestionCostsDef.js';
import { distanceAStarWeighted, distanceAStarWeightedEx } from './distanceAStarWeighted.js';
import { formatExResult } from './formatResultEx.js';
import { levenshteinDistance } from './levenshtein.js';
import type { WeightMap } from './weightedMaps.js';
import { addDefToWeightMap, createWeightMap } from './weightedMaps.js';

describe('distanceAStar', () => {
    test.each`
        wordA        | wordB
        ${''}        | ${''}
        ${'apple'}   | ${'apple'}
        ${'apple'}   | ${''}
        ${'apple'}   | ${'apples'}
        ${'apple'}   | ${'maple'}
        ${'grapple'} | ${'maples'}
    `('distanceAStar vs Levenshtein "$wordA" "$wordB"', ({ wordA, wordB }) => {
        const expected = levenshteinDistance(wordA, wordB) * 100;
        expect(distanceAStarWeighted(wordA, wordB, createWeightMap())).toBe(expected);
        expect(distanceAStarWeighted(wordB, wordA, createWeightMap())).toBe(expected);
    });

    test.each`
        wordA        | wordB
        ${''}        | ${''}
        ${'apple'}   | ${'apple'}
        ${'apple'}   | ${''}
        ${'apple'}   | ${'apples'}
        ${'apple'}   | ${'maple'}
        ${'grapple'} | ${'maples'}
    `('distanceAStarWeightedEx vs Levenshtein "$wordA" "$wordB"', ({ wordA, wordB }) => {
        expect(formatExResult(distanceAStarWeightedEx(wordA, wordB, createWeightMap()))).toMatchSnapshot();
        expect(formatExResult(distanceAStarWeightedEx(wordB, wordA, createWeightMap()))).toMatchSnapshot();
    });

    // cspell:ignore aeiou aeroplane
    test.each`
        wordA         | wordB                                    | map                                                  | expected
        ${''}         | ${''}                                    | ${undefined}                                         | ${0}
        ${'apple'}    | ${'growing'}                             | ${undefined}                                         | ${700}
        ${'apple'}    | ${'growing'}                             | ${{ map: 'apple_growing', replace: 99, insDel: 99 }} | ${693}
        ${'apple'}    | ${'apple'}                               | ${{ map: 'ae', insDel: 75 }}                         | ${0}
        ${'apple'}    | ${''}                                    | ${{ map: 'ae', insDel: 75 }}                         | ${450}
        ${'apple'}    | ${''}                                    | ${{ map: 'ae|(ap)', insDel: 75 }}                    | ${350}
        ${'apple'}    | ${''}                                    | ${{ map: '(ap)', insDel: 1 }}                        | ${301}
        ${'apple'}    | ${'apples'}                              | ${{ map: '(les)(le)', replace: 50 }}                 | ${50}
        ${'apple'}    | ${'maple'}                               | ${{ map: '(pp)p', replace: 50 }}                     | ${150}
        ${'grapple'}  | ${'maples'}                              | ${{ map: '(pp)p', replace: 50 }}                     | ${350}
        ${'bite'}     | ${'bate'}                                | ${{ map: 'aei', replace: 25 }}                       | ${25}
        ${'receive'}  | ${'recieve' /* cspell:ignore recieve */} | ${{ map: 'ei', swap: 25 }}                           | ${25}
        ${'airplane'} | ${'aeroplane'}                           | ${{ map: '(ai)(ae)', replace: 25 }}                  | ${125}
        ${'airplane'} | ${'aeroplane'}                           | ${{ map: '(air)(aero)|aeiou', replace: 25 }}         | ${25}
        ${'airplane'} | ${'aeroplane'}                           | ${{ map: 'aeiou', replace: 25 }}                     | ${125}
        ${'plain'}    | ${'plane'}                               | ${{ map: '(ane)(ain)', replace: 100 }}               | ${100}
    `('distanceAStar "$wordA" "$wordB" $map', ({ wordA, wordB, map, expected }) => {
        const weightMap = createWeightMap();
        if (map) addDefToWeightMap(weightMap, map);
        expect(distanceAStarWeighted(wordA, wordB, weightMap)).toBe(expected);
        expect(distanceAStarWeighted(wordB, wordA, weightMap)).toBe(expected);
    });

    // cspell:ignore defunishun

    test.each`
        wordA                | wordB                    | weightMap                      | expected
        ${''}                | ${''}                    | ${undefined}                   | ${0}
        ${'walk'}            | ${'walking'}             | ${undefined}                   | ${300}
        ${'walk'}            | ${''}                    | ${calcWeightMap(mapLetters())} | ${200}
        ${'1234'}            | ${''}                    | ${calcWeightMap(mapLetters())} | ${804}
        ${'walk'}            | ${'walking'}             | ${calcWeightMap()}             | ${50}
        ${'wake up'}         | ${'woken up'}            | ${calcWeightMap()}             | ${145}
        ${'definition'}      | ${'defunishun'}          | ${calcWeightMap()}             | ${45 + 40}
        ${'reputation'}      | ${'repetition'}          | ${calcWeightMap()}             | ${45 + 45}
        ${'gr8'}             | ${'great'}               | ${calcWeightMap()}             | ${250}
        ${'read'}            | ${'read7'}               | ${calcWeightMap()}             | ${201}
        ${'airplane'}        | ${'aeroplane'}           | ${calcWeightMap()}             | ${60}
        ${'talked'}          | ${'walking'}             | ${calcWeightMap()}             | ${150}
        ${'kings'}           | ${'king'}                | ${calcWeightMap()}             | ${50}
        ${'re-wind'}         | ${'rewind'}              | ${calcWeightMap()}             | ${202}
        ${'re-'}             | ${'re'}                  | ${calcWeightMap()}             | ${201}
        ${"I'm talk'n to u"} | ${'I am talking to you'} | ${calcWeightMap()}             | ${302}
        ${"wear'd u go?"}    | ${'where did you go?'}   | ${calcWeightMap()}             | ${204}
    `(
        'distanceAStar adv "$wordA" "$wordB" $map',
        ({
            wordA,
            wordB,
            weightMap,
            expected,
        }: {
            wordA: string;
            wordB: string;
            weightMap?: WeightMap;
            expected: number;
        }) => {
            weightMap = weightMap || createWeightMap();
            expect(distanceAStarWeighted(wordA, wordB, weightMap)).toBe(expected);
            expect(distanceAStarWeighted(wordB, wordA, weightMap)).toBe(expected);
        }
    );

    test.each`
        wordA                | wordB                    | weightMap                      | expected
        ${''}                | ${''}                    | ${undefined}                   | ${0}
        ${'walk'}            | ${'walking'}             | ${undefined}                   | ${300}
        ${'walk'}            | ${''}                    | ${calcWeightMap(mapLetters())} | ${200}
        ${'1234'}            | ${''}                    | ${calcWeightMap(mapLetters())} | ${804}
        ${'walk'}            | ${'walking'}             | ${calcWeightMap()}             | ${50}
        ${'wake up'}         | ${'woken up'}            | ${calcWeightMap()}             | ${145}
        ${'definition'}      | ${'defunishun'}          | ${calcWeightMap()}             | ${45 + 40}
        ${'reputation'}      | ${'repetition'}          | ${calcWeightMap()}             | ${45 + 45}
        ${'gr8'}             | ${'great'}               | ${calcWeightMap()}             | ${250}
        ${'read'}            | ${'read7'}               | ${calcWeightMap()}             | ${201}
        ${'airplane'}        | ${'aeroplane'}           | ${calcWeightMap()}             | ${60}
        ${'talked'}          | ${'walking'}             | ${calcWeightMap()}             | ${150}
        ${'kings'}           | ${'king'}                | ${calcWeightMap()}             | ${50}
        ${'re-wind'}         | ${'rewind'}              | ${calcWeightMap()}             | ${202}
        ${'re-'}             | ${'re'}                  | ${calcWeightMap()}             | ${201}
        ${"I'm talk'n to u"} | ${'I am talking to you'} | ${calcWeightMap()}             | ${302}
        ${"wear'd u go?"}    | ${'where did you go?'}   | ${calcWeightMap()}             | ${204}
    `(
        'distanceAStar adv "$wordA" "$wordB" $map',
        ({
            wordA,
            wordB,
            weightMap,
            expected,
        }: {
            wordA: string;
            wordB: string;
            weightMap?: WeightMap;
            expected: number;
        }) => {
            weightMap = weightMap || createWeightMap();
            const r1 = distanceAStarWeightedEx(wordA, wordB, weightMap);
            const r2 = distanceAStarWeightedEx(wordB, wordA, weightMap);
            expect(formatExResult(r1)).toMatchSnapshot();
            expect(formatExResult(r2)).toMatchSnapshot();
            expect(r1?.cost).toBe(expected);
            expect(r2?.cost).toBe(expected);
        }
    );

    test.each`
        wordA            | wordB            | weightMap             | expectedAB | expectedBA
        ${'walked'}      | ${'walked'}      | ${calcDefWeightMap()} | ${0}       | ${0}
        ${'walked'}      | ${'walk∙ed'}     | ${calcWeightMap()}    | ${100}     | ${100}
        ${'walked'}      | ${'walk∙ed'}     | ${calcDefWeightMap()} | ${200}     | ${100}
        ${'walked'}      | ${'walk∙ED'}     | ${calcDefWeightMap()} | ${1202}    | ${102}
        ${'walk-around'} | ${'walk∙Around'} | ${calcDefWeightMap()} | ${1101}    | ${101}
    `(
        'distanceAStar Asymmetrical penalties adv "$wordA" "$wordB" $map',
        ({
            wordA,
            wordB,
            weightMap,
            expectedAB,
            expectedBA,
        }: {
            wordA: string;
            wordB: string;
            weightMap: WeightMap;
            expectedAB: number;
            expectedBA: number;
        }) => {
            const r1 = distanceAStarWeightedEx(wordA, wordB, weightMap);
            const r2 = distanceAStarWeightedEx(wordB, wordA, weightMap);
            expect(formatExResult(r1)).toMatchSnapshot();
            expect(formatExResult(r2)).toMatchSnapshot();
            expect(r1?.cost).toBe(expectedAB);
            expect(r2?.cost).toBe(expectedBA);
        }
    );
});

function mapLetters(cost = 50): SuggestionCostMapDef {
    const letters = 'a'
        .repeat(27)
        .split('')
        .map((s, i) => String.fromCharCode(s.charCodeAt(0) + i))
        .join('');

    return {
        map: letters + letters.toUpperCase(),
        insDel: cost,
        replace: cost,
        swap: cost,
    };
}

function calcDefWeightMap(): WeightMap {
    return mapDictionaryInformationToWeightMap({});
}

function calcWeightMap(...defs: SuggestionCostMapDef[]): WeightMap {
    return createWeightMap(
        ...defs,
        {
            description: 'Make it cheap to add / remove common endings',
            map: '$(s$)(ed$)(es$)(ing$)',
            insDel: 50,
            replace: 50,
        },
        {
            description: 'Common mistakes',
            map: "(ie)(ei)|('n$)(n$)(ng$)(ing$)|(i'm)(I'm)(I am)|u(you)|w(wh)|(ear)(ere)|('d)( did)|('d)(ed)",
            replace: 51,
        },
        {
            map: 'aeiou',
            replace: 45,
            insDel: 75,
            swap: 55,
        },
        {
            map: 'u(oo)|o(oh)(ooh)|e(ee)(ea)|f(ph)(gh)|(shun)(tion)(sion)(cion)', // cspell:disable-line
            replace: 40,
        },
        {
            map: '(air)(aero)',
            replace: 60,
        },
        {
            map: '(air)(aer)(err)|(oar)(or)(hor)|(or)(our)',
            replace: 40,
        },
        {
            description: 'Penalty for inserting numbers',
            map: '0123456789',
            insDel: 1, // Cheap to insert,
            penalty: 200, // Costly later
        },
        {
            description: 'Discourage leading and trailing `-`',
            map: '(^-)(^)|($)(-$)',
            replace: 1, // Cheap to insert,
            penalty: 200, // Costly later
        },
        {
            description: 'Discourage inserting special characters `-`',
            map: '-._',
            insDel: 2, // Cheap to insert,
            penalty: 200, // Costly later
        }
    );
}
