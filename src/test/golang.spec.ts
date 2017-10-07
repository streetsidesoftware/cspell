import {expect} from 'chai';
import * as cspell from '../index';
import * as path from 'path';
import * as fsp from 'fs-extra';


const sampleFilename = path.join(__dirname, '..', '..', 'samples', 'src', 'sample.go');
const sampleFile = fsp.readFile(sampleFilename, 'UTF-8').then(buffer => buffer.toString());

describe('Validate that Go files are correctly checked.', () => {
    it('Tests the default configuration', () => {
        return sampleFile.then(text => {
            expect(text).to.not.be.empty;
            const ext = '.go';
            const languageIds = cspell.getLanguagesForExt(ext);
            const settings = cspell.getDefaultSettings();
            const fileSettings = cspell.combineTextAndLanguageSettings(settings, text, languageIds);
            return cspell.validateText(text, fileSettings)
                .then(results => {
                    expect(results).to.be.length(1);
                    /* cspell:ignore garbbage */
                    expect(results.map(t => t.text)).to.contain('garbbage');
                });
        });
    });
});
