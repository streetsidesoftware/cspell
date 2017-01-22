"use strict";
const chai_1 = require("chai");
const Dictionaries = require("./Dictionaries");
const fsp = require("fs-promise");
const DefaultSettings_1 = require("./DefaultSettings");
const defaultSettings = DefaultSettings_1.getDefaultSettings();
describe('Validate Dictionaries', () => {
    it('expects default to not be empty', () => {
        const mapDefs = Dictionaries.filterDictDefsToLoad(['php', 'wordsEn', 'unknown'], defaultSettings.dictionaryDefinitions);
        const files = mapDefs.map(a => a[1]).map(def => def.path);
        chai_1.expect(files.filter(a => a.includes('php.txt'))).to.be.lengthOf(1);
        chai_1.expect(files.filter(a => a.includes('wordsEn.txt'))).to.be.lengthOf(1);
        chai_1.expect(files.filter(a => a.includes('unknown'))).to.be.empty;
        // console.log(mapDefs);
    });
    it('tests that the files exist', () => {
        const defaultDicts = defaultSettings.dictionaryDefinitions;
        const dictIds = defaultDicts.map(def => def.name);
        const mapDefs = Dictionaries.filterDictDefsToLoad(dictIds, defaultSettings.dictionaryDefinitions);
        const access = mapDefs
            .map(p => p[1])
            .map(def => def.path)
            .map(path => fsp.access(path));
        return Promise.all(access);
    });
});
//# sourceMappingURL=Dictionaries.test.js.map