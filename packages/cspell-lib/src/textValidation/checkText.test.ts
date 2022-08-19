import * as checkText from './checkText';
import { IncludeExcludeFlag } from './checkText';

// cSpell:ignore brouwn jumpped lazzy wrongg mispelled ctrip nmove mischecked

describe('checkText', () => {
    test('calcIncludeExcludeInfo', async () => {
        const words = sampleWords;
        const info = await checkText.checkText(sampleText, { words, ignoreRegExpList: [/The/g] });
        const strings = info.items.map((a) => a.text);
        expect(strings).toHaveLength(17);
        expect(strings.join('')).toBe(sampleText);

        let last = 0;
        info.items.forEach((i) => {
            expect(i.startPos).toBe(last);
            last = i.endPos;
        });
        expect(last).toBe(sampleText.length);
    });

    test('calcIncludeExcludeInfo exclude everything', async () => {
        const words = sampleWords;
        const info = await checkText.checkText(sampleText, {
            words,
            ignoreRegExpList: [/(.|\s)+/],
        });
        const result = info.items.map((a) => a.text);
        expect(result).toHaveLength(1);
        expect(result.join('')).toBe(sampleText);
        expect(info.items[0].flagIE).toBe(IncludeExcludeFlag.EXCLUDE);
    });

    test('tests calcIncludeExcludeInfo include everything', async () => {
        const words = sampleWords;
        const info = await checkText.checkText(sampleText, { words });
        const result = info.items.map((a) => a.text);
        expect(result).toHaveLength(9);
        expect(result.join('')).toBe(sampleText);
        expect(info.items[0].flagIE).toBe(IncludeExcludeFlag.INCLUDE);
    });
});

// cspell:ignore lightbrown whiteberry redberry
const sampleText = `
    The elephant and giraffe
    The lightbrown worm ate the apple, mango, and, strawberry.
    The little ant ate the big purple grape.
    The orange tiger ate the whiteberry and the redberry.
`;

const sampleWords = [
    'and',
    'ant',
    'apple',
    'ate',
    'big',
    'elephant',
    'giraffe',
    'grape',
    'little',
    'mango',
    'orange',
    'purple',
    'the',
    'tiger',
    'worm',
];
