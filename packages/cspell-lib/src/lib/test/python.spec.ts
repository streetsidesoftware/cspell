import * as fsp from 'fs';
import * as path from 'path';
import { describe, expect, test } from 'vitest';

import { pathPackageSamples } from '../../test-util/test.locations.cjs';
import * as cspell from '../index.js';

const samples = pathPackageSamples;
const sampleFilename = path.join(samples, 'src', 'sample.py');
const sampleConfig = path.join(samples, '.cspell.json');
const text = fsp.readFileSync(sampleFilename, 'utf8').toString();

const timeout = 10000;

describe('Validate that Python files are correctly checked.', () => {
    test(
        'Tests the default configuration',
        async () => {
            expect(Object.keys(text)).not.toHaveLength(0);
            const ext = path.extname(sampleFilename);
            const languageIds = cspell.getLanguagesForExt(ext);
            const settings = cspell.mergeSettings(
                await cspell.getDefaultBundledSettingsAsync(),
                await cspell.readSettings(sampleConfig),
            );
            const fileSettings = cspell.combineTextAndLanguageSettings(settings, text, languageIds);
            return cspell.validateText(text, fileSettings).then((results) => {
                expect(results).toHaveLength(1);
                /* cspell:ignore garbbage */
                expect(results.map((t) => t.text)).toEqual(expect.arrayContaining(['garbbage']));
                return;
            });
        },
        { timeout },
    );
});
