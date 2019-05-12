"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const cspell = require("../index");
const path = require("path");
const fsp = require("fs-extra");
const sampleFilename = path.join(__dirname, '..', '..', 'samples', 'src', 'sample.go');
const sampleFile = fsp.readFile(sampleFilename, 'UTF-8').then(buffer => buffer.toString());
describe('Validate that Go files are correctly checked.', () => {
    it('Tests the default configuration', () => {
        return sampleFile.then(text => {
            chai_1.expect(text).to.not.be.empty;
            const ext = '.go';
            const languageIds = cspell.getLanguagesForExt(ext);
            const settings = cspell.getDefaultSettings();
            const fileSettings = cspell.combineTextAndLanguageSettings(settings, text, languageIds);
            return cspell.validateText(text, fileSettings)
                .then(results => {
                chai_1.expect(results).to.be.length(1);
                /* cspell:ignore garbbage */
                chai_1.expect(results.map(t => t.text)).to.contain('garbbage');
            });
        });
    });
});
//# sourceMappingURL=golang.spec.js.map