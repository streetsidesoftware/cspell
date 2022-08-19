import type { CSpellSettings } from '@cspell/cspell-types';
import { loremIpsum } from 'lorem-ipsum';
import { mergeSettings } from '../Settings';
import { getDefaultSettings } from '../Settings/DefaultSettings';
import * as tds from '../Settings/TextDocumentSettings';
import * as Validator from './validator';

// cSpell:ignore brouwn jumpped lazzy wrongg mispelled ctrip nmove mischecked

const ac = expect.arrayContaining;
const notAc = expect.not.arrayContaining;

describe('Validator', () => {
    test('validates the validator', async () => {
        const text = 'The quick brouwn fox jumpped over the lazzy dog.';
        const languageId = 'plaintext';
        const settings = getSettings(text, languageId);
        const results = await Validator.validateText(text, settings);
        const words = results.map(({ text }) => text);
        expect(words).toEqual(['brouwn', 'jumpped', 'lazzy']);
    });

    test('validates ignore Case', async () => {
        const text = 'The Quick brown fox Jumped over the lazy dog.';
        const languageId = 'plaintext';
        const settings = getSettings(text, languageId);
        const results = await Validator.validateText(text, settings);
        const words = results.map(({ text }) => text);
        expect(words).toEqual([]);
    });

    test('validate limit', async () => {
        const text = loremIpsum({ count: 5, units: 'paragraphs' });
        const languageId = 'plaintext';
        const settings = { ...getSettings(text, languageId), maxNumberOfProblems: 10 };
        const results = await Validator.validateText(text, settings);
        expect(results).toHaveLength(10);
    });

    test('validates reserved words', async () => {
        const text = 'constructor const prototype type typeof null undefined';
        const languageId = 'javascript';
        const settings = { ...getSettings(text, languageId), maxNumberOfProblems: 10 };
        const results = await Validator.validateText(text, settings);
        expect(results).toHaveLength(0);
    });

    test('validates regex inclusions/exclusions', async () => {
        const text = sampleCode;
        const languageId = 'plaintext';
        const settings = { ...getSettings(text, languageId), maxNumberOfProblems: 10 };
        const results = await Validator.validateText(text, settings);
        const words = results.map((wo) => wo.text);
        expect(words).toEqual(expect.arrayContaining(['wrongg']));
        expect(words).toEqual(expect.arrayContaining(['mispelled']));
        expect(words).toEqual(expect.not.arrayContaining(['xaccd']));
        expect(words).toEqual(expect.not.arrayContaining(['ctrip']));
        expect(words).toEqual(expect.not.arrayContaining(['FFEE']));
        expect(words).toEqual(expect.not.arrayContaining(['nmove']));
    });

    test('validates ignoreRegExpList', async () => {
        const text = sampleCode;
        const languageId = 'plaintext';
        const settings = {
            ...getSettings(text, languageId),
            maxNumberOfProblems: 10,
            ignoreRegExpList: ['^const [wy]RON[g]+', 'mis.*led'],
        };
        const results = await Validator.validateText(text, settings);
        const words = results.map((wo) => wo.text);
        expect(words).toEqual(expect.not.arrayContaining(['wrongg']));
        expect(words).toEqual(expect.not.arrayContaining(['mispelled']));
        expect(words).toEqual(expect.arrayContaining(['mischecked']));
    });

    test('validates ignoreRegExpList 2', async () => {
        const results = await Validator.validateText(sampleCode, {
            ignoreRegExpList: ['/^const [wy]ron[g]+/gim', '/MIS...LED/g', '/mischecked'],
        });
        const words = results.map((wo) => wo.text);
        expect(words).toEqual(expect.not.arrayContaining(['wrongg']));
        expect(words).toEqual(expect.arrayContaining(['mispelled']));
        expect(words).toEqual(expect.arrayContaining(['mischecked']));
    });

    test.each`
        settings                                             | expected                        | message
        ${{ ignoreRegExpList: ['/wrong[/gim', 'mis.*led'] }} | ${ac(['wrongg', 'mischecked'])} | ${'malformed ignoreRegExpList'}
        ${{ ignoreRegExpList: ['/wrong[/gim', 'mis.*led'] }} | ${notAc(['mispelled'])}         | ${'malformed ignoreRegExpList'}
        ${{}}                                                | ${notAc(['worlds'])}            | ${''}
        ${{ validateDirectives: true }}                      | ${ac(['worlds'])}               | ${'Invalid directive'}
    `('validates $message', async ({ settings, expected }) => {
        const langSettings = getSettings(sampleCode, 'plaintext');
        const finalSettings = mergeSettings(langSettings, settings);
        const results = await Validator.validateText(sampleCode, finalSettings);
        const words = results.map((wo) => wo.text);
        expect(words).toEqual(expected);
    });

    // cspell:ignore hellosd applesq bananasa respectss
    test('Issue #7', async () => {
        const text = `Fails to detect obviously misspelt words, such as:
            hellosd
            applesq
            bananasa
            respectss
        `;
        const expected = ['hellosd', 'applesq', 'bananasa', 'respectss'];
        const languageId = 'plaintext';
        const settings = getSettings(text, languageId);
        const results = await Validator.validateText(text, settings);
        const words = results.map(({ text }) => text);
        expect(words.sort()).toEqual(expected.sort());
    });

    test('Validates contractions', async () => {
        const text = `
            We have a bit of text to check. Don't look too hard.
            Which single quote to use? Is it shouldn't or shouldn’t?
        `;
        const languageId = 'plaintext';
        const settings = getSettings(text, languageId);
        const results = await Validator.validateText(text, settings);
        const words = results.map(({ text }) => text);
        expect(words.sort()).toEqual([]);
    });

    // cspell:ignore witth feww mistaks
    test('validateText with suggestions', async () => {
        const text = `
            Here is a bit of text witth a feww mistaks.
        `;
        const languageId = 'plaintext';
        const settings = getSettings(text, languageId);
        const result = await Validator.validateText(text, settings, { generateSuggestions: true, numSuggestions: 5 });
        expect(result).toMatchSnapshot();
    });

    // const isFoundTrue = { isFound: true };
    const isFoundFalse = { isFound: false };
    const isFlaggedTrue = { isFlagged: true };
    const isFlaggedFalse = { isFlagged: false };

    // cspell:ignore grappes colour
    test.each`
        text              | expected
        ${'hello'}        | ${[]}
        ${'flagged'}      | ${[mValIssue('flagged', isFlaggedTrue)]}
        ${'grappes'}      | ${[mValIssue('grappes', isFoundFalse, isFlaggedFalse)]}
        ${'colour'}       | ${[mValIssue('colour', isFlaggedTrue)]}
        ${'ignored'}      | ${[]}
        ${'crazzzy-code'} | ${[]}
        ${'hyphen-wordz'} | ${[]}
    `('validation "$text"', async ({ text, expected }) => {
        const settings = sampleSettings();
        const languageId = 'plaintext';
        const docSettings = tds.combineTextAndLanguageSettings(settings, text, languageId);
        const results = await Validator.validateText(text, docSettings);
        expect(results).toEqual(expected);
    });
});

// cspell:ignore xaccd ffee

const sampleCode = `

// Verify urls do not get checked.
const url = 'http://ctrip.com?q=words';

// Verify hex values.
const value = 0xaccd;

/* spell-checker:disable */

const weirdWords = ['ctrip', 'xebia', 'zando', 'zooloo'];

/* spell-checker:enable */

// spell:worlds

const wrongg = 'mispelled';
const check = 'mischecked';
const message = "\\nmove to next line";

const hex = 0xBADC0FFEE;

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

// cspell:ignore hte
const flagWords = ['hte', 'flagged', 'ignored'];
// cspell:ignore behaviour
const rejectWords = ['!colour', '!behaviour', '!favour'];

// cspell:ignore crazzzy wordz
const ignoreWords = ['ignored', 'crazzzy-code'];

const words = sampleWords.concat(rejectWords).concat(['hyphen-wordz']);

const sampleCSpell: CSpellSettings = {
    ...getDefaultSettings(true),
    version: '0.2',
    flagWords,
    words,
    ignoreWords,
};

const defaultSettings: CSpellSettings = {
    ...getDefaultSettings(true),
    enabledLanguageIds: ['plaintext', 'javascript'],
};

function mValIssue(text: string, ...parts: Partial<Validator.ValidationIssue>[]): Validator.ValidationIssue {
    const issue: Partial<Validator.ValidationIssue> = {
        text,
    };
    for (const p of parts) {
        Object.assign(issue, p);
    }
    return oc<Validator.ValidationIssue>(issue);
}

function sampleSettings() {
    return Object.freeze({ ...sampleCSpell });
}

function getSettings(text: string, languageId: string) {
    return tds.combineTextAndLanguageSettings(defaultSettings, text, languageId);
}

function oc<T>(t: Partial<T>): T {
    return expect.objectContaining(t);
}
