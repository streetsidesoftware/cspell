import * as cspell from '../index';
import * as path from 'path';
import * as fsp from 'fs-extra';

const samples = path.join(__dirname, '..', '..', 'samples', 'bug-fixes');
const configFile = path.join(samples, 'cspell.json');

const files = ['bug345.ts', '../src/sample.go'];

describe('Validate Against Bug Fixes', () => {
    jest.setTimeout(10000);
    function t(filename: string) {
        test(`validate ${filename}`, async () => {
            const fullFilename = path.resolve(samples, filename);
            const ext = path.extname(filename);
            const text = await fsp.readFile(fullFilename, 'utf-8');
            const languageIds = cspell.getLanguagesForExt(ext);
            const settings = cspell.mergeSettings(cspell.getDefaultBundledSettings(), cspell.readSettings(configFile));
            const fileSettings = cspell.combineTextAndLanguageSettings(settings, text, languageIds);
            const result = await cspell.validateText(text, fileSettings);
            expect(result).toMatchSnapshot();
        });
    }

    files.forEach(t);
});
