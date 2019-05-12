"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Dictionaries = require("./Dictionaries");
const Settings_1 = require("../Settings");
describe('Validate getDictionary', () => {
    it('tests that userWords are included in the dictionary', () => {
        const settings = Object.assign({}, Settings_1.getDefaultSettings(), { words: ['one', 'two', 'three'], userWords: ['four', 'five', 'six'] });
        return Dictionaries.getDictionary(settings).then(dict => {
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
//# sourceMappingURL=Dictionaries.test.js.map