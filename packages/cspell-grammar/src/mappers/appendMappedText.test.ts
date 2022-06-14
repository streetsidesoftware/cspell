import { appendMappedText } from './appendMappedText';
import { MappedText } from './types';

describe('appendMappedText', () => {
    test.each`
        aText    | aMap            | bText   | bMap            | abText     | abMap
        ${''}    | ${undefined}    | ${''}   | ${undefined}    | ${''}      | ${undefined}
        ${''}    | ${[]}           | ${''}   | ${undefined}    | ${''}      | ${[0, 0]}
        ${'abc'} | ${[0, 0, 6, 3]} | ${'de'} | ${undefined}    | ${'abcde'} | ${[0, 0, 6, 3, 8, 5]}
        ${'abc'} | ${[0, 0, 6, 3]} | ${'de'} | ${[5, 0, 8, 2]} | ${'abcde'} | ${[0, 0, 6, 3, 11, 3, 14, 5]}
        ${'abc'} | ${[3, 0, 6, 3]} | ${'de'} | ${[5, 0, 8, 2]} | ${'abcde'} | ${[0, 0, 3, 0, 6, 3, 11, 3, 14, 5]}
        ${''}    | ${[3, 0, 6, 0]} | ${'de'} | ${[5, 0, 8, 2]} | ${'de'}    | ${[0, 0, 3, 0, 6, 0, 11, 0, 14, 2]}
    `('appendMappedText $aText $aMap => $bText $bMap', ({ aText, aMap, bText, bMap, abText, abMap }) => {
        expect(appendMappedText(mt(aText, aMap), mt(bText, bMap))).toEqual(mt(abText, abMap));
    });
});

function mt(text: string, map: number[] | undefined): MappedText {
    return { text, map };
}
