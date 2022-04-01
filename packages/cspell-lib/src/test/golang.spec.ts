import * as cspell from '../index';
import * as path from 'path';
import * as fsp from 'fs-extra';

const sampleFilename = path.join(__dirname, '..', '..', 'samples', 'src', 'sample.go');
const sampleFile = fsp.readFile(sampleFilename, 'utf8').then((buffer) => buffer.toString());

describe('Validate that Go files are correctly checked.', () => {
    jest.setTimeout(10000);
    test('Tests the default configuration', async () => {
        const text = await sampleFile;
        expect(Object.keys(text)).not.toHaveLength(0);
        const ext = '.go';
        const languageIds = cspell.getLanguagesForExt(ext);
        const settings = cspell.getDefaultBundledSettings();
        const fileSettings = cspell.combineTextAndLanguageSettings(settings, text, languageIds);
        // cspell:ignore weirdd garbbage
        const results1 = await cspell.validateText('some weirdd garbbage', fileSettings);
        expect(results1.map((t) => t.text)).toEqual(expect.arrayContaining(['weirdd']));
        expect(results1.map((t) => t.text)).toEqual(expect.arrayContaining(['garbbage']));
        const results = await cspell.validateText(text, fileSettings);
        expect(results).toHaveLength(1);
        expect(results.map((t) => t.text)).toEqual(expect.arrayContaining(['garbbage']));
    });
});
