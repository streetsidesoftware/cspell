import * as fs from 'node:fs';
import { createRequire } from 'node:module';
import * as path from 'node:path';

import { describe, expect, test } from 'vitest';

import { pathPackageSamples } from '../../test-util/index.mjs';
import * as cspell from '../index.js';
import * as util from '../util/util.js';

const require = createRequire(import.meta.url);

const sampleFilename = path.join(pathPackageSamples, 'French.md');
const text = fs.readFileSync(sampleFilename, 'utf8').toString();
// eslint-disable-next-line unicorn/prefer-module
const frenchConfig = require.resolve('@cspell/dict-fr-fr/cspell-ext.json');

const timeout = 10000;

describe('Validate that French text is correctly checked.', () => {
    test(
        'Tests the default configuration',
        async () => {
            expect(Object.keys(text)).not.toHaveLength(0);
            const ext = path.extname(sampleFilename);
            const languageIds = cspell.getLanguagesForExt(ext);
            const frenchSettings = await cspell.readSettings(frenchConfig);
            const settings = cspell.mergeSettings(await cspell.getDefaultBundledSettingsAsync(), frenchSettings, {
                language: 'en,fr',
            });
            const fileSettings = cspell.combineTextAndLanguageSettings(settings, text, languageIds);
            const results = await cspell.validateText(text, fileSettings);
            /* cspell:ignore aujourd’hui */
            expect(
                results
                    .map((a) => a.text)
                    .filter(util.uniqueFn())
                    .sort(),
            ).toEqual([]);
        },
        { timeout },
    );
});
