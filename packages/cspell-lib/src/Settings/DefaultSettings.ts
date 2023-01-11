import type { PredefinedPatterns, RegExpPatternDefinition } from '@cspell/cspell-types';
import { parsers } from 'cspell-grammar';

import type { CSpellSettingsInternal } from '../Models/CSpellSettingsInternalDef';
import { createCSpellSettingsInternal } from '../Models/CSpellSettingsInternalDef';
import { PatternRegExp } from '../Models/PatternRegExp';
import { resolveFile } from '../util/resolveFile';
import { readSettings } from './Controller/configLoader';
import * as LanguageSettings from './LanguageSettings';
import * as RegPat from './RegExpPatterns';
import { mergeSettings } from './index';

const defaultConfigFileModuleRef = '@cspell/cspell-bundled-dicts/cspell-default.json';

// Do not use require.resolve because webpack will mess it up.
const defaultConfigFile = resolveConfigModule(defaultConfigFileModuleRef);

const regExpSpellCheckerDisable = [
    new PatternRegExp(RegPat.regExSpellingGuardBlock),
    new PatternRegExp(RegPat.regExSpellingGuardLine),
    new PatternRegExp(RegPat.regExSpellingGuardNext),
];

// cspell:ignore filetypes
const predefinedPatterns = [
    // Exclude patterns
    { name: 'CommitHash', pattern: RegPat.regExCommitHash },
    { name: 'CommitHashLink', pattern: RegPat.regExCommitHashLink },
    { name: 'CStyleHexValue', pattern: RegPat.regExCStyleHexValue },
    { name: 'CSSHexValue', pattern: RegPat.regExCSSHexValue },
    { name: 'Urls', pattern: RegPat.regExMatchUrls },
    { name: 'HexValues', pattern: RegPat.regExMatchCommonHexFormats },
    { name: 'SpellCheckerDisable', pattern: regExpSpellCheckerDisable },
    { name: 'PublicKey', pattern: RegPat.regExPublicKey },
    { name: 'RsaCert', pattern: RegPat.regExCert },
    { name: 'SshRsa', pattern: RegPat.regExSshRSA },
    { name: 'EscapeCharacters', pattern: RegPat.regExEscapeCharacters },
    { name: 'Base64', pattern: RegPat.regExBase64 },
    { name: 'Base64SingleLine', pattern: RegPat.regExBase64SingleLine },
    { name: 'Base64MultiLine', pattern: RegPat.regExBase64MultiLine },
    { name: 'Email', pattern: RegPat.regExEmail },
    { name: 'SHA', pattern: RegPat.regExSha },
    { name: 'HashStrings', pattern: RegPat.regExHashStrings },
    { name: 'UnicodeRef', pattern: RegPat.regExUnicodeRef },
    { name: 'UUID', pattern: RegPat.regExUUID },
    { name: 'href', pattern: RegPat.regExHRef },
    { name: 'SpellCheckerDisableBlock', pattern: RegPat.regExSpellingGuardBlock },
    { name: 'SpellCheckerDisableLine', pattern: RegPat.regExSpellingGuardLine },
    { name: 'SpellCheckerDisableNext', pattern: RegPat.regExSpellingGuardNext },
    { name: 'SpellCheckerIgnoreInDocSetting', pattern: RegPat.regExIgnoreSpellingDirectives },

    // Include Patterns
    { name: 'PhpHereDoc', pattern: RegPat.regExPhpHereDoc },
    { name: 'string', pattern: RegPat.regExString },
    { name: 'CStyleComment', pattern: RegPat.regExCStyleComments },
    { name: 'Everything', pattern: '.*' },
] as const;

type NameType<T> = T extends readonly { name: infer U }[] ? U : never;

type ExtendsType<T, U> = T extends U ? T : never;

type PredefinedPatternNames = ExtendsType<NameType<typeof predefinedPatterns>, PredefinedPatterns>;

const defaultRegExpPatterns: RegExpPatternDefinition[] = [...predefinedPatterns].map(normalizePattern);

const definedDefaultRegExpExcludeList: PredefinedPatterns[] = [
    'SpellCheckerDisable',
    'SpellCheckerIgnoreInDocSetting',
    'Urls',
    'Email',
    'RsaCert',
    'SshRsa',
    'Base64MultiLine',
    'Base64SingleLine',
    'CommitHash',
    'CommitHashLink',
    'CStyleHexValue',
    'CSSHexValue',
    'SHA',
    'HashStrings',
    'UnicodeRef',
    'UUID',
];

// This bit of copying is done to have the complier ensure that the defaults exist.
const defaultRegExpExcludeList: PredefinedPatternNames[] = definedDefaultRegExpExcludeList;

export const _defaultSettingsBasis: Readonly<CSpellSettingsInternal> = Object.freeze(
    createCSpellSettingsInternal({
        id: 'static_defaults',
        language: 'en',
        name: 'Static Defaults',
        enabled: true,
        enabledLanguageIds: [],
        maxNumberOfProblems: 100,
        numSuggestions: 10,
        suggestionsTimeout: 500,
        suggestionNumChanges: 3,
        words: [],
        userWords: [],
        ignorePaths: [],
        allowCompoundWords: false,
        patterns: defaultRegExpPatterns,
        ignoreRegExpList: [],
        languageSettings: [],
        source: { name: 'defaultSettings' },
        reporters: [],
        plugins: [{ parsers }],
    })
);

export const _defaultSettings: Readonly<CSpellSettingsInternal> = Object.freeze(
    createCSpellSettingsInternal({
        ..._defaultSettingsBasis,
        enabledLanguageIds: [
            'ada',
            'csharp',
            'go',
            'javascript',
            'javascriptreact',
            'json',
            'markdown',
            'mdx',
            'php',
            'plaintext',
            'python',
            'text',
            'typescript',
            'typescriptreact',
            'haskell',
            'html',
            'css',
            'less',
            'scss',
            'latex',
            'ruby',
            'rust',
            'shellscript',
            'toml',
        ],
        ignoreRegExpList: defaultRegExpExcludeList,
        languageSettings: LanguageSettings.getDefaultLanguageSettings(),
    })
);

const getSettings = (function () {
    let settings: CSpellSettingsInternal | undefined = undefined;
    return function (useDefaultDictionaries: boolean) {
        if (!useDefaultDictionaries) {
            return _defaultSettingsBasis;
        }
        if (!settings) {
            const jsonSettings = readSettings(defaultConfigFile);
            settings = mergeSettings(_defaultSettings, jsonSettings);
            if (jsonSettings.name !== undefined) {
                settings.name = jsonSettings.name;
            } else {
                delete settings.name;
            }
        }
        return settings;
    };
})();

function resolveConfigModule(configModuleName: string) {
    return resolveFile(configModuleName, __dirname).filename;
}

function normalizePattern(pat: RegExpPatternDefinition): RegExpPatternDefinition {
    const { name, pattern, description } = pat;
    if (!(pattern instanceof RegExp)) return pat;

    return {
        name,
        pattern: new PatternRegExp(pattern),
        description,
    };
}

export function getDefaultSettings(useDefaultDictionaries = true): CSpellSettingsInternal {
    return getSettings(useDefaultDictionaries);
}

export function getDefaultBundledSettings(): CSpellSettingsInternal {
    return getDefaultSettings();
}
