import { SuggestionCostMapDef, WeightMap } from '.';
import { distanceAStarWeighted } from './distanceAStarWeighted';
import { levenshteinDistance } from './levenshtein';
import { addDefToWeightMap, createWeightMap } from './weightedMaps';

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

    // cspell:ignore aeiou
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

    test.each`
        wordA                | wordB                    | weightMap                      | expected
        ${''}                | ${''}                    | ${undefined}                   | ${0}
        ${'walk'}            | ${'walking'}             | ${undefined}                   | ${300}
        ${'walk'}            | ${''}                    | ${calcWeightMap(mapLetters())} | ${200}
        ${'1234'}            | ${''}                    | ${calcWeightMap(mapLetters())} | ${400}
        ${'walk'}            | ${'walking'}             | ${calcWeightMap()}             | ${50}
        ${'wake up'}         | ${'woken up'}            | ${calcWeightMap()}             | ${145}
        ${'definition'}      | ${'defunishun'}          | ${calcWeightMap()}             | ${45 + 40}
        ${'reputation'}      | ${'repetition'}          | ${calcWeightMap()}             | ${45 + 45}
        ${'airplane'}        | ${'aeroplane'}           | ${calcWeightMap()}             | ${60}
        ${'talked'}          | ${'walking'}             | ${calcWeightMap()}             | ${150}
        ${'kings'}           | ${'king'}                | ${calcWeightMap()}             | ${50}
        ${"I'm talk'n to u"} | ${'I am talking to you'} | ${calcWeightMap()}             | ${302}
        ${"wear'd u go?"}    | ${'where did you go?'}   | ${calcWeightMap()}             | ${304}
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
            map: 'u(oo)|o(oh)(ooh)|e(ee)(ea)|f(ph)(gh)|(shun)(tion)(sion)(cion)',
            replace: 40,
        },
        {
            map: '(air)(aero)',
            replace: 60,
        },
        {
            map: '(air)(aer)(err)|(oar)(or)(hor)|(or)(our)',
            replace: 40,
        }
    );
}
