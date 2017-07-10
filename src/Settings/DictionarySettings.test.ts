import { expect } from 'chai';
import * as DictSettings from './DictionarySettings';
import * as fsp from 'fs-extra';
import { getDefaultSettings } from './DefaultSettings';

const defaultSettings = getDefaultSettings();

describe('Validate DictionarySettings', () => {
    it('expects default to not be empty', () => {
        const mapDefs = DictSettings.filterDictDefsToLoad(['php', 'wordsEn', 'unknown', 'en_us'], defaultSettings.dictionaryDefinitions!);
        const files = mapDefs.map(a => a[1]).map(def => def.path!);
        expect(files.filter(a => a.includes('php.txt'))).to.be.lengthOf(1);
        expect(files.filter(a => a.includes('wordsEn.trie'))).to.be.lengthOf(0);
        expect(files.filter(a => a.includes('en_US.trie'))).to.be.lengthOf(1);
        expect(files.filter(a => a.includes('unknown'))).to.be.empty;
        // console.log(mapDefs);
    });

    it('tests that the files exist', () => {
        const defaultDicts = defaultSettings.dictionaryDefinitions!;
        const dictIds = defaultDicts.map(def => def.name);
        const mapDefs = DictSettings.filterDictDefsToLoad(dictIds, defaultSettings.dictionaryDefinitions!);
        const access = mapDefs
            .map(p => p[1])
            .map(def => def.path!)
            .map(path => fsp.access(path));
        expect(mapDefs.length).to.be.greaterThan(0);
        return Promise.all(access);
    });

    it('tests normalizing the dictionary paths', () => {
        const { dictionaryDefinitions } = defaultSettings;
        expect(dictionaryDefinitions).to.not.be.empty;
        const defs = DictSettings.normalizePathForDictDefs(dictionaryDefinitions!, '.');
        expect(defs.length).to.be.equal(dictionaryDefinitions!.length);
    });
});

