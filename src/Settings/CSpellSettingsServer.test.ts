import { expect } from 'chai';
import {
    mergeSettings, readSettings, getGlobalSettings, clearCachedFiles, getCachedFileSize, checkFilenameMatchesGlob, calcOverrideSettings
} from './CSpellSettingsServer';
import { getDefaultSettings } from './DefaultSettings';
import { CSpellUserSettings } from './CSpellSettingsDef';
import * as path from 'path';

describe('Validate CSpellSettingsServer', () => {
    it('tests mergeSettings', () => {
        expect(mergeSettings({}, {})).to.be.deep.equal({
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
        });
    });

    it('tests mergeSettings', () => {
        expect(mergeSettings({}, {enabled: true})).to.be.deep.equal({
            enabled: true,
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
        });
    });

    it('tests mergeSettings', () => {
        expect(mergeSettings({}, {enabled: false})).to.be.deep.equal({
            enabled: false,
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
        });
    });

    it('tests mergeSettings', () => {
        expect(mergeSettings({enabled: true}, {enabled: false})).to.be.deep.equal({
            enabled: false,
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
        });
    });

    it('tests loading a missing cSpell.json file', () => {
        const filename = path.join(__dirname, '..', '..', 'samples', 'linked', 'cspell-missing.json');
        const settings = readSettings(filename);
        expect(settings).to.not.be.empty;
        expect(settings.words).to.not.include('import');
    });

    it('tests loading a cSpell.json file', () => {
        const filename = path.join(__dirname, '..', '..', 'samples', 'linked', 'cspell-import.json');
        const settings = readSettings(filename);
        expect(settings).to.not.be.empty;
        expect(settings.words).to.include('import');
    });

    it('tests loading a cSpell.json with multiple imports file', () => {
        const filename = path.join(__dirname, '..', '..', 'samples', 'linked', 'cspell-imports.json');
        const settings = readSettings(filename);
        expect(settings).to.not.be.empty;
        expect(settings.words).to.include('import');
        expect(settings.words).to.include('imports');
        // cspell:word leuk
        expect(settings.words).to.include('leuk');
    });

    it('makes sure global settings is an object', () => {
        const settings = getGlobalSettings();
        expect(settings).to.not.be.empty;
        const merged = mergeSettings(getDefaultSettings(), getGlobalSettings());
        expect(merged).to.not.be.empty;
    });

    it('verify clearing the file cache works', () => {
        mergeSettings(getDefaultSettings(), getGlobalSettings());
        expect(getCachedFileSize()).to.be.gt(0);
        clearCachedFiles();
        expect(getCachedFileSize()).to.be.eq(0);
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

        tests.forEach(({f, g, e}) => expect(checkFilenameMatchesGlob(f, g), `f: ${f}, g: ${g}, e: ${e}`).to.be.equal(e));
    });

    it('test calcOverrideSettings', () => {
        interface Test { f: string; e: [keyof CSpellUserSettings, string][]; }
        const tests: Test[] = [
            { f: 'nested/dir/spell.test.ts', e: [['languageId', 'typescript']]},
        ];

        tests.forEach(({f, e}) => {
            const r = calcOverrideSettings(sampleSettings, f);
            e.forEach(([k, v]) => expect(r[k]).to.be.equal(v));
        });
    });
});


const sampleSettings: CSpellUserSettings = {
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
