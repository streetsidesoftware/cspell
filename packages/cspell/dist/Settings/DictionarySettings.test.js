"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const DictSettings = require("./DictionarySettings");
const fsp = require("fs-extra");
const DefaultSettings_1 = require("./DefaultSettings");
const defaultSettings = DefaultSettings_1.getDefaultSettings();
describe('Validate DictionarySettings', () => {
    it('expects default to not be empty', () => {
        const mapDefs = DictSettings.filterDictDefsToLoad(['php', 'wordsEn', 'unknown', 'en_us'], defaultSettings.dictionaryDefinitions);
        const files = mapDefs.map(a => a[1]).map(def => def.name);
        chai_1.expect(mapDefs).to.be.lengthOf(2);
        chai_1.expect(files.filter(a => a.includes('php'))).to.be.lengthOf(1);
        chai_1.expect(files.filter(a => a.includes('wordsEn'))).to.be.lengthOf(0);
        chai_1.expect(files.filter(a => a.includes('en_us'))).to.be.lengthOf(1);
        chai_1.expect(files.filter(a => a.includes('unknown'))).to.be.empty;
        // console.log(mapDefs);
    });
    it('tests exclusions and empty ids', () => {
        const ids = [
            'php',
            'cpp',
            'wordsEn',
            '  ',
            'unknown',
            '!cpp',
            'en_us',
        ];
        const expected = ['php', 'en_us'].sort();
        const mapDefs = DictSettings.filterDictDefsToLoad(ids, defaultSettings.dictionaryDefinitions);
        const dicts = mapDefs.map(a => a[1]).map(def => def.name).sort();
        chai_1.expect(dicts).to.be.deep.equal(expected);
    });
    it('tests that the files exist', () => {
        const defaultDicts = defaultSettings.dictionaryDefinitions;
        const dictIds = defaultDicts.map(def => def.name);
        const mapDefs = DictSettings.filterDictDefsToLoad(dictIds, defaultSettings.dictionaryDefinitions);
        const access = mapDefs
            .map(p => p[1])
            .map(def => def.path)
            .map(path => fsp.access(path));
        chai_1.expect(mapDefs.length).to.be.greaterThan(0);
        return Promise.all(access);
    });
    it('tests normalizing the dictionary paths', () => {
        const { dictionaryDefinitions } = defaultSettings;
        chai_1.expect(dictionaryDefinitions).to.not.be.empty;
        const defs = DictSettings.normalizePathForDictDefs(dictionaryDefinitions, '.');
        chai_1.expect(defs.length).to.be.equal(dictionaryDefinitions.length);
    });
});
//# sourceMappingURL=DictionarySettings.test.js.map