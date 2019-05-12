"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const cspell = require("./index");
describe('Validate the cspell API', function () {
    this.timeout(30000);
    it('Tests the default configuration', () => {
        const ext = '.json';
        const languageIds = cspell.getLanguagesForExt(ext);
        const settings = cspell.getDefaultSettings();
        // cspell:ignore jansons
        const text = '{ "name": "Jansons"}';
        const fileSettings = cspell.combineTextAndLanguageSettings(settings, text, languageIds);
        return cspell.validateText(text, fileSettings)
            .then(results => {
            chai_1.expect(results).to.not.be.empty;
            chai_1.expect(results.map(to => to.text)).to.contain('Jansons');
        });
    });
});
//# sourceMappingURL=index.test.js.map