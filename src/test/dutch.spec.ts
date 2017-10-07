import {expect} from 'chai';
import * as cspell from '../index';
import * as path from 'path';
import * as fsp from 'fs-extra';
import * as dutchDict from 'cspell-dict-nl-nl';
import * as util from '../util/util';

const sampleFilename = path.join(__dirname, '..', '..', 'samples', 'Dutch.txt');
const sampleFile = fsp.readFile(sampleFilename, 'UTF-8').then(buffer => buffer.toString());
const dutchConfig = dutchDict.getConfigLocation();

describe('Validate that Dutch text is correctly checked.', () => {
    it('Tests the default configuration', () => {
        return sampleFile.then(text => {
            expect(text).to.not.be.empty;
            const ext = path.extname(sampleFilename);
            const languageIds = cspell.getLanguagesForExt(ext);
            const dutchSettings = cspell.readSettings(dutchConfig);
            const settings = cspell.mergeSettings(cspell.getDefaultSettings(), dutchSettings, { language: 'en,nl' });
            const fileSettings = cspell.combineTextAndLanguageSettings(settings, text, languageIds);
            return cspell.validateText(text, fileSettings)
                .then(results => {
                    /* cspell:ignore ANBI RABO RABONL unported */
                    expect(results.map(a => a.text).filter(util.uniqueFn()).sort()).deep.equals(['ANBI', 'RABO', 'RABONL', 'unported']);
                });
        });
    });
});
