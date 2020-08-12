import * as cspell from '../index';
import * as path from 'path';
import * as fsp from 'fs-extra';


const samples = path.join(__dirname, '..', '..', 'samples');
const sampleFilename = path.join(samples, 'src', 'sample.py');
const sampleConfig = path.join(samples, '.cspell.json');
const sampleFile = fsp.readFile(sampleFilename, 'utf8').then(buffer => buffer.toString());

describe('Validate that Python files are correctly checked.', () => {
    jest.setTimeout(10000);
    test('Tests the default configuration', () => {
        return sampleFile.then(text => {
            expect(Object.keys(text)).not.toHaveLength(0);
            const ext = path.extname(sampleFilename);
            const languageIds = cspell.getLanguagesForExt(ext);
            const settings = cspell.mergeSettings(cspell.getDefaultSettings(), cspell.readSettings(sampleConfig));
            const fileSettings = cspell.combineTextAndLanguageSettings(settings, text, languageIds);
            return cspell.validateText(text, fileSettings)
                .then(results => {
                    expect(results).toHaveLength(1);
                    /* cspell:ignore garbbage */
                    expect(results.map(t => t.text)).toEqual(expect.arrayContaining(['garbbage']));
                });
        });
    });
});
