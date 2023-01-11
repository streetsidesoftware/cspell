import * as path from 'path';

import { loadTextDocument } from '../Models/TextDocument';
import { loadConfig } from '../Settings';
import { determineTextDocumentSettings } from './determineTextDocumentSettings';

const samples = path.resolve(__dirname, '../../samples');
const cfgPath = path.join(samples, '.cspell.json');
const oc = expect.objectContaining;

describe('determineTextDocumentSettings', () => {
    test.each`
        file          | configFile | expected
        ${__filename} | ${cfgPath} | ${oc({ languageId: 'typescript' })}
    `('determineTextDocumentSettings', async ({ file, configFile, expected }) => {
        const cfg = await loadConfig(configFile);
        const doc = await loadTextDocument(file);
        const settings = determineTextDocumentSettings(doc, cfg);
        expect(settings.dictionaries).toContain('Test Dictionary');
        expect(settings).toEqual(expected);
    });
});
