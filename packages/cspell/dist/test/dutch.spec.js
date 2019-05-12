"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const cspell = require("../index");
const path = require("path");
const fsp = require("fs-extra");
const dutchDict = require("cspell-dict-nl-nl");
const util = require("../util/util");
const sampleFilename = path.join(__dirname, '..', '..', 'samples', 'Dutch.txt');
const sampleFile = fsp.readFile(sampleFilename, 'UTF-8').then(buffer => buffer.toString());
const dutchConfig = dutchDict.getConfigLocation();
describe('Validate that Dutch text is correctly checked.', function () {
    it('Tests the default configuration', function () {
        this.timeout(30000);
        return sampleFile.then(text => {
            chai_1.expect(text).to.not.be.empty;
            const ext = path.extname(sampleFilename);
            const languageIds = cspell.getLanguagesForExt(ext);
            const dutchSettings = cspell.readSettings(dutchConfig);
            const settings = cspell.mergeSettings(cspell.getDefaultSettings(), dutchSettings, { language: 'en,nl' });
            const fileSettings = cspell.combineTextAndLanguageSettings(settings, text, languageIds);
            return cspell.validateText(text, fileSettings)
                .then(results => {
                /* cspell:ignore ANBI RABO RABONL unported */
                chai_1.expect(results.map(a => a.text).filter(util.uniqueFn()).sort()).deep.equals(['ANBI', 'RABO', 'RABONL', 'unported']);
            });
        });
    });
});
//# sourceMappingURL=dutch.spec.js.map