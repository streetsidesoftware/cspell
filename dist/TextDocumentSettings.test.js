"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
const chai_1 = require("chai");
const TextDocumentSettings_1 = require("./TextDocumentSettings");
const DefaultSettings_1 = require("./DefaultSettings");
describe('Validate TextDocumentSettings', () => {
    it('tests that userWords are included in the dictionary', () => {
        const settings = __assign({}, DefaultSettings_1.getDefaultSettings(), { words: ['one', 'two', 'three'], userWords: ['four', 'five', 'six'] });
        return TextDocumentSettings_1.getDictionary(settings).then(dict => {
            settings.words.forEach(word => {
                chai_1.expect(dict.has(word)).to.be.true;
            });
            settings.userWords.forEach(word => {
                chai_1.expect(dict.has(word)).to.be.true;
            });
            chai_1.expect(dict.has('zero')).to.be.false;
        });
    });
});
//# sourceMappingURL=TextDocumentSettings.test.js.map