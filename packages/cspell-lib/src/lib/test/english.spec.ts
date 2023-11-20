import { createSuggestOptions } from 'cspell-dictionary';
import { describe, expect, test } from 'vitest';

import * as getDictionary from '../getDictionary.js';
import * as cspell from '../index.js';
import { validateText } from '../validator.js';

const timeout = 10000;

describe('Validate English', () => {
    test(
        'Tests suggestions',
        async () => {
            const ext = '.txt';
            const languageIds = cspell.getLanguagesForExt(ext);
            const settings = await cspell.getDefaultBundledSettingsAsync();
            // cspell:ignore jansons
            const text = '{ "name": "Jansons"}';
            const fileSettings = cspell.combineTextAndLanguageSettings(settings, text, languageIds);
            const finalSettings = cspell.finalizeSettings(fileSettings);
            const dict = await getDictionary.getDictionary(finalSettings);

            const startTime = process.hrtime();
            // cspell:ignore installsallnecessary
            const results = dict.suggest(
                'installsallnecessary',
                createSuggestOptions(5, cspell.CompoundWordsMethod.SEPARATE_WORDS, 3),
            );
            const elapsed = elapsedTimeMsFrom(startTime);
            console.log(`Elapsed time ${elapsed.toFixed(2)}ms`);
            const sugs = results.map((a) => a.word);
            expect(sugs).toEqual(expect.arrayContaining(['installs all necessary']));
        },
        { timeout },
    );

    test(
        'validate some text',
        async () => {
            const ext = '.txt';
            const languageIds = cspell.getLanguagesForExt(ext);
            const settings = { ...(await cspell.getDefaultBundledSettingsAsync()), words: ['é', 'î'] };
            const text = `
        Here are some words.
        thing and cpp are words.
        é'thing and î'cpp are ok.
        `;
            const fileSettings = cspell.combineTextAndLanguageSettings(settings, text, languageIds);
            const finalSettings = cspell.finalizeSettings(fileSettings);

            const r = await validateText(text, finalSettings);
            expect(r).toEqual([]);
        },
        { timeout },
    );

    // cspell:ignore latviešu
    test(
        'validate some json',
        async () => {
            const ext = '.json';
            const languageIds = cspell.getLanguagesForExt(ext);
            const settings = { ...(await cspell.getDefaultBundledSettingsAsync()) };
            const text = `
        {
            'bidi': False,
            'code': 'lv',
            'name': 'Latvian',
            'name_local': 'latviešu',
        }
        `.normalize('NFD');

            const fileSettings = cspell.combineTextAndLanguageSettings(settings, text, languageIds);
            const finalSettings = cspell.finalizeSettings(fileSettings);

            const r = await validateText(text, finalSettings);
            expect(r.map((t) => t.text)).toEqual(['latviešu'.normalize('NFD')]);
        },
        { timeout },
    );

    test(
        'validate compound words',
        async () => {
            const ext = '.py';
            const languageIds = cspell.getLanguagesForExt(ext);
            const settings = { ...(await cspell.getDefaultBundledSettingsAsync()) };
            // cspell:ignore setsid isinstance
            const text = `
        setsid = 'R'

        def to_roman(number):
            if not isinstance(number, int):
                raise NotIntegerError('Non-integers cannot be converted.')

            if not (0 < number < 5000):
                raise OutOfRangeError(
                    'Valid numbers are 1 to 4999, got {0}'.format(number))

            r = ''
            for (num, numeral) in ordered:
                if num <= number:
                    number -= num
                    r += numeral
            return setsid + r
        `;

            const fileSettings = cspell.combineTextAndLanguageSettings(settings, text, languageIds);
            const finalSettings = cspell.finalizeSettings(fileSettings);

            const r = await validateText(text, finalSettings);
            expect(r.map((a) => a.text)).toEqual(['setsid', 'setsid']);
        },
        { timeout },
    );
});

function elapsedTimeMsFrom(relativeTo: [number, number]): number {
    return hrTimeToMs(process.hrtime(relativeTo));
}

function hrTimeToMs(hrTime: [number, number]): number {
    return hrTime[0] * 1.0e3 + hrTime[1] * 1.0e-6;
}
