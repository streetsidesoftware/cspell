import * as fs from 'fs';
import * as path from 'path';

import * as cspell from '../index';
import * as util from '../util/util';

const sampleFilename = path.join(__dirname, '../../samples/Seattle.fa.md');
const text = fs.readFileSync(sampleFilename, 'utf8').toString();
const frenchConfig = require.resolve('@cspell/dict-fa-ir/cspell-ext.json');

describe('Validate that Persian text is correctly checked.', () => {
    jest.setTimeout(10000);

    test('Tests the default configuration', async () => {
        expect(Object.keys(text)).not.toHaveLength(0);
        const ext = path.extname(sampleFilename);
        const languageIds = cspell.getLanguagesForExt(ext);
        const frenchSettings = cspell.readSettings(frenchConfig);
        const settings = cspell.mergeSettings(cspell.getDefaultBundledSettings(), frenchSettings, {
            language: 'en,fa',
        });
        const fileSettings = cspell.combineTextAndLanguageSettings(settings, text, languageIds);
        const results = await cspell.validateText(text, fileSettings);
        /* cspell:ignore aujourd’hui */
        expect(
            results
                .map((a) => a.text)
                .filter(util.uniqueFn())
                .sort()
        ).toEqual([]);
    });
});
