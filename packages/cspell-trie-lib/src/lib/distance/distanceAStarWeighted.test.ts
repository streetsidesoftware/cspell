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
        wordA         | wordB                                    | map                                          | expected
        ${''}         | ${''}                                    | ${undefined}                                 | ${0}
        ${'apple'}    | ${'apple'}                               | ${{ map: 'ae', insDel: 75 }}                 | ${0}
        ${'apple'}    | ${''}                                    | ${{ map: 'ae', insDel: 75 }}                 | ${450}
        ${'apple'}    | ${''}                                    | ${{ map: 'ae|(ap)', insDel: 75 }}            | ${350}
        ${'apple'}    | ${''}                                    | ${{ map: '(ap)', insDel: 1 }}                | ${301}
        ${'apple'}    | ${'apples'}                              | ${{ map: '(les)(le)', replace: 50 }}         | ${50}
        ${'apple'}    | ${'maple'}                               | ${{ map: '(pp)p', replace: 50 }}             | ${150}
        ${'grapple'}  | ${'maples'}                              | ${{ map: '(pp)p', replace: 50 }}             | ${350}
        ${'bite'}     | ${'bate'}                                | ${{ map: 'aei', replace: 25 }}               | ${25}
        ${'receive'}  | ${'recieve' /* cspell:ignore recieve */} | ${{ map: 'ei', swap: 25 }}                   | ${25}
        ${'airplane'} | ${'aeroplane'}                           | ${{ map: '(ai)(ae)', replace: 25 }}          | ${125}
        ${'airplane'} | ${'aeroplane'}                           | ${{ map: '(air)(aero)|aeiou', replace: 25 }} | ${25}
        ${'airplane'} | ${'aeroplane'}                           | ${{ map: 'aeiou', replace: 25 }}             | ${125}
        ${'plain'}    | ${'plane'}                               | ${{ map: '(ane)(ain)', replace: 100 }}       | ${100}
    `('distanceAStar vs Levenshtein "$wordA" "$wordB" $map', ({ wordA, wordB, map, expected }) => {
        const weightMap = createWeightMap();
        if (map) addDefToWeightMap(weightMap, map);
        expect(distanceAStarWeighted(wordA, wordB, weightMap)).toBe(expected);
        expect(distanceAStarWeighted(wordB, wordA, weightMap)).toBe(expected);
    });
});
