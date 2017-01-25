"use strict";
const chai_1 = require("chai");
const LanguageSettings_1 = require("./LanguageSettings");
describe('Validate LanguageSettings', () => {
    it('tests merging language settings', () => {
        const sPython = LanguageSettings_1.calcSettingsForLanguage(LanguageSettings_1.defaultLanguageSettings, 'python', 'en');
        chai_1.expect(sPython.allowCompoundWords).to.be.true;
        chai_1.expect((sPython.dictionaries || []).sort()).to.be.deep.equal(['wordsEn', 'filetypes', 'companies', 'softwareTerms', 'python', 'misc'].sort());
        const sPhp = LanguageSettings_1.calcSettingsForLanguage(LanguageSettings_1.defaultLanguageSettings, 'php', 'en-gb');
        chai_1.expect(sPhp.allowCompoundWords).to.be.undefined;
        chai_1.expect((sPhp.dictionaries || []).sort())
            .to.be.deep.equal(['wordsEnGb', 'filetypes', , 'companies', 'softwareTerms', 'php', 'html', 'npm', 'fonts', 'css', 'typescript', 'misc'].sort());
    });
});
//# sourceMappingURL=LanguageSettings.test.js.map