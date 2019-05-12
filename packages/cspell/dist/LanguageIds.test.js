"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const LangId = require("./LanguageIds");
const gensequence_1 = require("gensequence");
describe('Validate LanguageIds', () => {
    it('tests looking up a few extensions', () => {
        chai_1.expect(LangId.getLanguagesForExt('ts')).to.contain('typescript');
        chai_1.expect(LangId.getLanguagesForExt('.tex')).to.contain('latex');
        chai_1.expect(LangId.getLanguagesForExt('tex')).to.contain('latex');
    });
    it('test that all extensions start with a .', () => {
        const ids = LangId.buildLanguageExtensionMap(LangId.languageExtensionDefinitions);
        const badExtensions = gensequence_1.genSequence(ids.keys())
            .filter(ext => ext[0] !== '.')
            .toArray();
        chai_1.expect(badExtensions, 'All extensions are expected to begin with a .').to.be.empty;
    });
});
//# sourceMappingURL=LanguageIds.test.js.map