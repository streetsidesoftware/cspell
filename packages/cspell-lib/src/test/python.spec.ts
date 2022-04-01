import * as cspell from '../index';
import * as path from 'path';
import * as fsp from 'fs-extra';

const samples = path.join(__dirname, '..', '..', 'samples');
const sampleFilename = path.join(samples, 'src', 'sample.py');
const sampleConfig = path.join(samples, '.cspell.json');
const text = fsp.readFileSync(sampleFilename, 'utf8').toString();

describe('Validate that Python files are correctly checked.', () => {
    jest.setTimeout(10000);
    test('Tests the default configuration', () => {
        expect(Object.keys(text)).not.toHaveLength(0);
        const ext = path.extname(sampleFilename);
        const languageIds = cspell.getLanguagesForExt(ext);
        const settings = cspell.mergeSettings(cspell.getDefaultBundledSettings(), cspell.readSettings(sampleConfig));
        const fileSettings = cspell.combineTextAndLanguageSettings(settings, text, languageIds);
        return cspell.validateText(text, fileSettings).then((results) => {
            expect(results).toHaveLength(1);
            /* cspell:ignore garbbage */
            expect(results.map((t) => t.text)).toEqual(expect.arrayContaining(['garbbage']));
            return;
        });
    });
});
