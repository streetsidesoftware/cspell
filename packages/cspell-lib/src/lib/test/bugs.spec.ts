import * as fsp from 'node:fs/promises';
import * as path from 'node:path';

import { describe, expect, test } from 'vitest';

import { pathPackageSamples } from '../../test-util/test.locations.cjs';
import * as cspell from '../index.js';

const samples = path.join(pathPackageSamples, 'bug-fixes');
const configFile = path.join(samples, 'cspell.json');

const files = ['bug345.ts', '../src/sample.go'];

const timeout = 10000;

describe('Validate Against Bug Fixes', () => {
    function t(filename: string) {
        test(
            `validate ${filename}`,
            async () => {
                const fullFilename = path.resolve(samples, filename);
                const ext = path.extname(filename);
                const text = await fsp.readFile(fullFilename, 'utf-8');
                const languageIds = cspell.getLanguagesForExt(ext);
                const settings = cspell.mergeSettings(
                    await cspell.getDefaultBundledSettingsAsync(),
                    await cspell.readSettings(configFile),
                );
                const fileSettings = cspell.combineTextAndLanguageSettings(settings, text, languageIds);
                const result = await cspell.validateText(text, fileSettings);
                expect(result).toMatchSnapshot();
            },
            { timeout },
        );
    }

    files.forEach(t);
});
