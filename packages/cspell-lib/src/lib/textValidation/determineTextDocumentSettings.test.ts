import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, test } from 'vitest';

import { pathPackageSamples } from '../../test-util/test.locations.cjs';
import { loadTextDocument } from '../Models/TextDocument.js';
import { loadConfig } from '../Settings/index.js';
import { determineTextDocumentSettings } from './determineTextDocumentSettings.js';

const __filename = fileURLToPath(import.meta.url);

const samples = pathPackageSamples;
const cfgPath = path.join(samples, '.cspell.json');
const oc = <T>(obj: T) => expect.objectContaining(obj);

describe('determineTextDocumentSettings', () => {
    test.each`
        file          | configFile | expected
        ${__filename} | ${cfgPath} | ${oc({ languageId: 'typescript' })}
    `('determineTextDocumentSettings', async ({ file, configFile, expected }) => {
        const cfg = await loadConfig(configFile);
        const doc = await loadTextDocument(file);
        const settings = await determineTextDocumentSettings(doc, cfg);
        expect(settings.dictionaries).toContain('Test Dictionary');
        expect(settings).toEqual(expected);
    });
});
