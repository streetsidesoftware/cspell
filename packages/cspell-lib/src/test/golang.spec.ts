import {expect} from 'chai';
import * as cspell from '../index';
import * as path from 'path';
import * as fsp from 'fs-extra';


const sampleFilename = path.join(__dirname, '..', '..', 'samples', 'src', 'sample.go');
const sampleFile = fsp.readFile(sampleFilename, 'UTF-8').then(buffer => buffer.toString());

describe('Validate that Go files are correctly checked.', () => {
    jest.setTimeout(10000);
    test('Tests the default configuration', async () => {
        const text = await sampleFile;
        expect(text).to.not.be.empty;
        const ext = '.go';
        const languageIds = cspell.getLanguagesForExt(ext);
        const settings = cspell.getDefaultSettings();
        const fileSettings = cspell.combineTextAndLanguageSettings(settings, text, languageIds);
        // cspell:ignore weirdd garbbage
        const results1 = await cspell.validateText('some weirdd garbbage', fileSettings);
        expect(results1.map(t => t.text)).to.contain('weirdd');
        expect(results1.map(t => t.text)).to.contain('garbbage');
        const results = await cspell.validateText(text, fileSettings);
        expect(results).to.be.length(1);
        expect(results.map(t => t.text)).to.contain('garbbage');
    });
});
