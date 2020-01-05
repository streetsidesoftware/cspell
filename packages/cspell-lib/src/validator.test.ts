import * as Validator from './validator';
const loremIpsum = require('lorem-ipsum');
import { CSpellSettings } from './Settings';
import * as tds from './Settings/TextDocumentSettings';

import { getDefaultSettings } from './Settings/DefaultSettings';

import { IncludeExcludeFlag } from './validator';

// cSpell:ignore brouwn jumpped lazzy wrongg mispelled ctrip nmove mischecked

const defaultSettings: CSpellSettings = { ...getDefaultSettings(), enabledLanguageIds: ['plaintext', 'javascript']};

function getSettings(text: string, languageId: string) {
    return tds.combineTextAndLanguageSettings(defaultSettings, text, languageId);
}

describe('Validator', () => {
    test('validates the validator', () => {
        const text = 'The quick brouwn fox jumpped over the lazzy dog.';
        const languageId = 'plaintext';
        const settings = getSettings(text, languageId);
        const results = Validator.validateText(text, settings);
        return results.then(results => {
            const words = results.map(({text}) => text);
            expect(words).toEqual(['brouwn', 'jumpped', 'lazzy']);
        });
    });

    test('validates ignore Case', () => {
        const text = 'The Quick brown fox Jumped over the lazy dog.';
        const languageId = 'plaintext';
        const settings = getSettings(text, languageId);
        const results = Validator.validateText(text, settings);
        return results.then(results => {
            const words = results.map(({text}) => text);
            expect(words).toEqual([]);
        });
    });

    test('validate limit', () => {
        const text = loremIpsum({ count: 5, unit: 'paragraphs' });
        const languageId = 'plaintext';
        const settings = {...getSettings(text, languageId), maxNumberOfProblems: 10 };
        const results = Validator.validateText(text, settings);
        return results.then(results => expect(results).toHaveLength(10));
    });

    test('validates reserved words', () => {
        const text = 'constructor const prototype type typeof null undefined';
        const languageId = 'javascript';
        const settings = {...getSettings(text, languageId), maxNumberOfProblems: 10 };
        const results = Validator.validateText(text, settings);
        return results.then(results => expect(results).toHaveLength(0));
    });

    test('validates regex inclusions/exclusions', () => {
        const text = sampleCode;
        const languageId = 'plaintext';
        const settings = {...getSettings(text, languageId), maxNumberOfProblems: 10 };
        const results = Validator.validateText(text, settings);
        return results.then(results => {
            const words = results.map(wo => wo.text);
            expect(words).toEqual(expect.arrayContaining(['wrongg']));
            expect(words).toEqual(expect.arrayContaining(['mispelled']));
            expect(words).toEqual(expect.not.arrayContaining(['xaccd']));
            expect(words).toEqual(expect.not.arrayContaining(['ctrip']));
            expect(words).toEqual(expect.not.arrayContaining(['FFEE']));
            expect(words).toEqual(expect.not.arrayContaining(['nmove']));
        });
    });

    test('validates ignoreRegExpList', () => {
        const text = sampleCode;
        const languageId = 'plaintext';
        const settings = {...getSettings(text, languageId), maxNumberOfProblems: 10, ignoreRegExpList: ['^const [wy]RON[g]+', 'mis.*led'] };
        const results = Validator.validateText(text, settings);
        return results.then(results => {
            const words = results.map(wo => wo.text);
            expect(words).toEqual(expect.not.arrayContaining(['wrongg']));
            expect(words).toEqual(expect.not.arrayContaining(['mispelled']));
            expect(words).toEqual(expect.arrayContaining(['mischecked']));
        });
    });

    test('validates ignoreRegExpList 2', () => {
        const results = Validator.validateText(
            sampleCode,
            { ignoreRegExpList: ['/^const [wy]ron[g]+/gim', '/MIS...LED/g', '/mischecked'] }
        );
        return results.then(results => {
            const words = results.map(wo => wo.text);
            expect(words).toEqual(expect.not.arrayContaining(['wrongg']));
            expect(words).toEqual(expect.arrayContaining(['mispelled']));
            expect(words).toEqual(expect.arrayContaining(['mischecked']));
        });
    });

    test('validates malformed ignoreRegExpList', () => {
        const results = Validator.validateText(sampleCode, { ignoreRegExpList: ['/wrong[/gim', 'mis.*led'] });
        return results.then(results => {
            const words = results.map(wo => wo.text);
            expect(words).toEqual(expect.arrayContaining(['wrongg']));
            expect(words).toEqual(expect.not.arrayContaining(['mispelled']));
            expect(words).toEqual(expect.arrayContaining(['mischecked']));
        });
    });

    // cspell:ignore hellosd applesq bananasa respectss
    test('Issue #7', () => {
        const text = `Fails to detect obviously misspelt words, such as:
            hellosd
            applesq
            bananasa
            respectss
        `;
        const expected = [
            'hellosd',
            'applesq',
            'bananasa',
            'respectss',
       ];
        const languageId = 'plaintext';
        const settings = getSettings(text, languageId);
        const results = Validator.validateText(text, settings);
        return results.then(results => {
            const words = results.map(({text}) => text);
            expect(words.sort()).toEqual(expected.sort());
        });
    });

    test('Validates contractions', () => {
        const text = `
            We have a bit of text to check. Don't look too hard.
            Which single quote to use? Is it shouldn't or shouldn’t?
        `;
        const languageId = 'plaintext';
        const settings = getSettings(text, languageId);
        const results = Validator.validateText(text, settings);
        return results.then(results => {
            const words = results.map(({text}) => text);
            expect(words.sort()).toEqual([]);
        });
    });
    test('tests calcIncludeExcludeInfo', async () => {
        const words = sampleWords;
        const info = await Validator.checkText(sampleText, { words, ignoreRegExpList: [/The/g]});
        const strings = info.items.map(a => a.text);
        expect(strings).toHaveLength(17);
        expect(strings.join('')).toBe(sampleText);

        let last = 0;
        info.items.forEach(i => {
            expect(i.startPos).toBe(last);
            last = i.endPos;
        });
        expect(last).toBe(sampleText.length);
    });

    test('tests calcIncludeExcludeInfo exclude everything', async () => {
        const words = sampleWords;
        const info = await Validator.checkText(sampleText, { words, ignoreRegExpList: [/(.|\s)+/]});
        const result = info.items.map(a => a.text);
        expect(result).toHaveLength(1);
        expect(result.join('')).toBe(sampleText);
        expect(info.items[0].flagIE).toBe(IncludeExcludeFlag.EXCLUDE);
    });

    test('tests calcIncludeExcludeInfo include everything', async () => {
        const words = sampleWords;
        const info = await Validator.checkText(sampleText, { words });
        const result = info.items.map(a => a.text);
        expect(result).toHaveLength(9);
        expect(result.join('')).toBe(sampleText);
        expect(info.items[0].flagIE).toBe(IncludeExcludeFlag.INCLUDE);
    });
});

const sampleCode = `

// Verify urls do not get checked.
const url = 'http://ctrip.com?q=words';

// Verify hex values.
const value = 0xaccd;

/* spell-checker:disable */

const weirdWords = ['ctrip', 'xebia', 'zando', 'zooloo'];

/* spell-checker:enable */

const wrongg = 'mispelled';
const check = 'mischecked';
const message = "\\nmove to next line";

const hex = 0xBADC0FFEE;

`;

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
