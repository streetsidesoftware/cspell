import nodePath from 'node:path';
import nodeUrl from 'node:url';

import { describe, expect, test } from 'vitest';

import { pathPackageFixtures } from '../../test-util/test.locations.js';
import * as checkText from './checkText.js';
import { IncludeExcludeFlag } from './checkText.js';

const oc = (...params: Parameters<typeof expect.objectContaining>) => expect.objectContaining(...params);
const ac = (...params: Parameters<typeof expect.arrayContaining>) => expect.arrayContaining(...params);

const fixturesDir = nodePath.resolve(pathPackageFixtures);
const featuresDir = resolveFixture('features');

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
        const infoOld = await checkText.checkTextOld(sampleText, { words });
        expect(info).toEqual(infoOld);
        const result = info.items.map((a) => a.text);
        expect(result.join('')).toBe(sampleText);
        expect(result).toHaveLength(9);
        expect(info.items[0].flagIE).toBe(IncludeExcludeFlag.INCLUDE);
    });
});

describe('checkTextDocument', () => {
    test('checkTextDocument', async () => {
        const url = resolveFeatureFixtureUrl('substitutions/README.md');
        const result = await checkText.checkTextDocument({ uri: url.href }, {}, {});
        const errors = result.items.filter((i) => i.isError);
        // cspell:ignore Fréchet 'echet
        expect(errors).toEqual(ac([oc({ text: "Fr\\'echet" })]));
    });
});

function resolveFixture(...parts: string[]): string {
    return nodePath.resolve(fixturesDir, ...parts);
}

function resolveFeatureFixture(...parts: string[]): string {
    return nodePath.resolve(featuresDir, ...parts);
}

function resolveFeatureFixtureUrl(...parts: string[]): URL {
    return nodeUrl.pathToFileURL(resolveFeatureFixture(...parts));
}

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
