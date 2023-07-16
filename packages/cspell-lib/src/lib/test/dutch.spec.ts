import * as fs from 'fs';
import * as path from 'path';
import { describe, expect, test } from 'vitest';

import { pathPackageSamples } from '../../test-util/test.locations.js';
import * as cspell from '../index.js';
import * as util from '../util/util.js';

const sampleFilename = path.join(pathPackageSamples, 'Dutch.txt');
const text = fs.readFileSync(sampleFilename, 'utf8').toString();
const dutchConfig = require.resolve('@cspell/dict-nl-nl/cspell-ext.json');

const timeout = 10000;

describe('Validate that Dutch text is correctly checked.', () => {
    test(
        'Tests the default configuration',
        async () => {
            expect(Object.keys(text)).not.toHaveLength(0);
            const ext = path.extname(sampleFilename);
            const languageIds = cspell.getLanguagesForExt(ext);
            const dutchSettings = cspell.readSettings(dutchConfig);
            const settings = cspell.mergeSettings(cspell.getDefaultBundledSettings(), dutchSettings, {
                language: 'en,nl',
            });
            const fileSettings = cspell.combineTextAndLanguageSettings(settings, text, languageIds);
            const results = await cspell.validateText(text, fileSettings);
            /* cspell:ignore ANBI RABO RABONL unported */
            expect(
                results
                    .map((a) => a.text)
                    .filter(util.uniqueFn())
                    .sort(),
            ).toEqual(['RABO', 'RABONL', 'unported']);
        },
        { timeout },
    );
});
