"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const CSpellSettingsServer_1 = require("./CSpellSettingsServer");
const DefaultSettings_1 = require("./DefaultSettings");
const path = require("path");
describe('Validate CSpellSettingsServer', () => {
    it('tests mergeSettings', () => {
        const left = { name: 'Left' };
        const right = { name: 'Right' };
        chai_1.expect(CSpellSettingsServer_1.mergeSettings(left, right)).to.be.deep.equal({
            words: [],
            name: 'Left|Right',
            id: '|',
            userWords: [],
            ignoreWords: [],
            flagWords: [],
            patterns: [],
            enabledLanguageIds: [],
            languageSettings: [],
            ignoreRegExpList: [],
            dictionaries: [],
            dictionaryDefinitions: [],
            source: { name: 'Left|Right', sources: [left, right] },
        });
    });
    it('tests mergeSettings', () => {
        const left = { id: 'left' };
        const enabled = { id: 'enabledId', name: 'enabledName', enabled: true };
        chai_1.expect(CSpellSettingsServer_1.mergeSettings(left, enabled)).to.be.deep.equal({
            enabled: true,
            name: '|enabledName',
            id: 'left|enabledId',
            words: [],
            userWords: [],
            ignoreWords: [],
            flagWords: [],
            patterns: [],
            enabledLanguageIds: [],
            languageSettings: [],
            ignoreRegExpList: [],
            dictionaries: [],
            dictionaryDefinitions: [],
            source: { name: 'left|enabledName', sources: [left, enabled] },
        });
    });
    it('tests mergeSettings', () => {
        const right = { id: 'right', enabled: false };
        const left = { id: 'left', enabled: true };
        chai_1.expect(CSpellSettingsServer_1.mergeSettings({}, right)).to.be.deep.equal(right);
        chai_1.expect(CSpellSettingsServer_1.mergeSettings(left, {})).to.be.deep.equal(left);
        chai_1.expect(CSpellSettingsServer_1.mergeSettings(left, right)).to.be.deep.equal({
            enabled: right.enabled,
            name: '|',
            id: [left.id, right.id].join('|'),
            words: [],
            userWords: [],
            ignoreWords: [],
            flagWords: [],
            patterns: [],
            enabledLanguageIds: [],
            languageSettings: [],
            ignoreRegExpList: [],
            dictionaries: [],
            dictionaryDefinitions: [],
            source: { name: 'left|right', sources: [left, right] },
        });
    });
    it('tests mergeSettings', () => {
        chai_1.expect(CSpellSettingsServer_1.mergeSettings({ enabled: true }, { enabled: false })).to.be.deep.equal({
            enabled: false,
            name: '|',
            id: '|',
            words: [],
            userWords: [],
            ignoreWords: [],
            flagWords: [],
            patterns: [],
            enabledLanguageIds: [],
            languageSettings: [],
            ignoreRegExpList: [],
            dictionaries: [],
            dictionaryDefinitions: [],
            source: { name: 'left|right', sources: [{ enabled: true }, { enabled: false }] },
        });
    });
    it('tests mergeSettings when left/right are the same', () => {
        chai_1.expect(CSpellSettingsServer_1.mergeSettings(DefaultSettings_1._defaultSettings, DefaultSettings_1._defaultSettings)).to.be.equal(DefaultSettings_1._defaultSettings);
    });
    it('tests mergeSettings when lefts are the same', () => {
        const base = CSpellSettingsServer_1.mergeSettings(DefaultSettings_1._defaultSettings, {});
        const setting1 = CSpellSettingsServer_1.mergeSettings(base, {});
        const setting2 = CSpellSettingsServer_1.mergeSettings(base, setting1);
        chai_1.expect(setting2).to.be.equal(setting1);
        const setting3 = CSpellSettingsServer_1.mergeSettings(DefaultSettings_1._defaultSettings, setting1);
        chai_1.expect(setting3).to.be.equal(setting1);
    });
    it('tests mergeSettings when rights are the same', () => {
        const base = CSpellSettingsServer_1.mergeSettings(DefaultSettings_1._defaultSettings, { id: 'right' });
        const setting1 = CSpellSettingsServer_1.mergeSettings({ id: 'setting1' }, base);
        const setting2 = CSpellSettingsServer_1.mergeSettings(setting1, base);
        chai_1.expect(setting2).to.be.equal(setting1);
        const setting3 = CSpellSettingsServer_1.mergeSettings(DefaultSettings_1._defaultSettings, setting1);
        chai_1.expect(setting3).to.be.not.equal(setting1);
        const setting4 = CSpellSettingsServer_1.mergeSettings(setting3, base);
        chai_1.expect(setting4).to.be.equal(setting3);
    });
    it('tests loading a missing cSpell.json file', () => {
        const filename = path.join(__dirname, '..', '..', 'samples', 'linked', 'cspell-missing.json');
        const settings = CSpellSettingsServer_1.readSettings(filename);
        chai_1.expect(settings).to.not.be.empty;
        chai_1.expect(settings.words).to.be.undefined;
    });
    it('tests loading a cSpell.json file', () => {
        const filename = path.join(__dirname, '..', '..', 'samples', 'linked', 'cspell-import.json');
        const settings = CSpellSettingsServer_1.readSettings(filename);
        chai_1.expect(settings).to.not.be.empty;
        chai_1.expect(settings.words).to.include('import');
    });
    it('tests loading a cSpell.json with multiple imports file', () => {
        const filename = path.join(__dirname, '..', '..', 'samples', 'linked', 'cspell-imports.json');
        const settings = CSpellSettingsServer_1.readSettings(filename);
        chai_1.expect(settings).to.not.be.empty;
        chai_1.expect(settings.words).to.include('import');
        chai_1.expect(settings.words).to.include('imports');
        // cspell:word leuk
        chai_1.expect(settings.words).to.include('leuk');
    });
    it('makes sure global settings is an object', () => {
        const settings = CSpellSettingsServer_1.getGlobalSettings();
        chai_1.expect(settings).to.not.be.empty;
        const merged = CSpellSettingsServer_1.mergeSettings(DefaultSettings_1.getDefaultSettings(), CSpellSettingsServer_1.getGlobalSettings());
        chai_1.expect(merged).to.not.be.empty;
    });
    it('verify clearing the file cache works', () => {
        CSpellSettingsServer_1.mergeSettings(DefaultSettings_1.getDefaultSettings(), CSpellSettingsServer_1.getGlobalSettings());
        chai_1.expect(CSpellSettingsServer_1.getCachedFileSize()).to.be.gt(0);
        CSpellSettingsServer_1.clearCachedFiles();
        chai_1.expect(CSpellSettingsServer_1.getCachedFileSize()).to.be.eq(0);
    });
    it('test the loaded defaults contain expected settings', () => {
        const settings = DefaultSettings_1.getDefaultSettings();
        const sources = CSpellSettingsServer_1.getSources(settings);
        const sourceNames = sources
            .map(s => s.name || '?');
        chai_1.expect(sourceNames).to.contain(DefaultSettings_1._defaultSettings.name);
    });
});
describe('Validate Overrides', () => {
    it('tests  checkFilenameMatchesGlob', () => {
        const tests = [
            { f: 'nested/dir/spell.test.ts', g: 'nested/**', e: true },
            { f: 'nested/dir/spell.test.ts', g: 'nested', e: false },
            { f: 'nested/dir/spell.test.ts', g: '*.ts', e: true },
            { f: 'nested/dir/spell.test.ts', g: '**/*.ts', e: true },
            { f: 'nested/dir/spell.test.ts', g: ['**/*.ts'], e: true },
            { f: 'nested/dir/spell.test.ts', g: ['**/dir/**/*.ts'], e: true },
            { f: 'nested/dir/spell.test.js', g: ['**/*.ts'], e: false },
            { f: 'nested/dir/spell.test.js', g: ['*.ts', '*.test.js'], e: true },
            { f: '/cspell-dicts/nl_NL/Dutch.txt', g: '**/nl_NL/**', e: true },
        ];
        tests.forEach(({ f, g, e }) => chai_1.expect(CSpellSettingsServer_1.checkFilenameMatchesGlob(f, g), `f: ${f}, g: ${g}, e: ${e}`).to.be.equal(e));
    });
    it('test calcOverrideSettings', () => {
        const tests = [
            { f: 'nested/dir/spell.test.ts', e: [['languageId', 'typescript']] },
        ];
        tests.forEach(({ f, e }) => {
            const r = CSpellSettingsServer_1.calcOverrideSettings(sampleSettings, f);
            e.forEach(([k, v]) => chai_1.expect(r[k]).to.be.equal(v));
        });
    });
});
const sampleSettings = {
    language: 'en',
    languageId: 'plaintext',
    overrides: [
        {
            filename: '**/*.ts',
            languageId: 'typescript',
        },
        {
            filename: '**/*.lex',
            languageId: 'lex',
        },
        {
            filename: '**/NL/*.txt',
            language: 'en,nl',
        },
    ],
};
//# sourceMappingURL=CSpellSettingsServer.test.js.map