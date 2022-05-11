import type { PredefinedPatterns, RegExpPatternDefinition } from '@cspell/cspell-types';
import { createCSpellSettingsInternal, CSpellSettingsInternal } from '../Models/CSpellSettingsInternalDef';
import { PatternRegExp } from '../Models/PatternRegExp';
import { resolveFile } from '../util/resolveFile';
import { readSettings } from './configLoader';
import { DEFAULT_IGNORE_REG_EXP_LIST } from './defaultIgnoreRegExpList';
import { mergeSettings } from './index';
import * as LanguageSettings from './LanguageSettings';
import * as RegPat from './RegExpPatterns';

const defaultConfigFileModuleRef = '@cspell/cspell-bundled-dicts/cspell-default.json';

// Do not use require.resolve because webpack will mess it up.
const defaultConfigFile = resolveConfigModule(defaultConfigFileModuleRef);

const regExpSpellCheckerDisable = [
    new PatternRegExp(RegPat.regExSpellingGuardBlock),
    new PatternRegExp(RegPat.regExSpellingGuardLine),
    new PatternRegExp(RegPat.regExSpellingGuardNext),
];

const predefinedPatterns = [
    // Exclude patterns, alphabetically sorted
    { name: 'Base64', pattern: RegPat.regExBase64 },
    { name: 'Base64MultiLine', pattern: RegPat.regExBase64MultiLine },
    { name: 'Base64SingleLine', pattern: RegPat.regExBase64SingleLine },
    { name: 'CommitHash', pattern: RegPat.regExCommitHash },
    { name: 'CommitHashLink', pattern: RegPat.regExCommitHashLink },
    { name: 'CSSHexValue', pattern: RegPat.regExCSSHexValue },
    { name: 'CStyleHexValue', pattern: RegPat.regExCStyleHexValue },
    { name: 'Email', pattern: RegPat.regExEmail },
    { name: 'EscapeCharacters', pattern: RegPat.regExEscapeCharacters },
    { name: 'HashStrings', pattern: RegPat.regExHashStrings },
    { name: 'HexValues', pattern: RegPat.regExMatchCommonHexFormats },
    { name: 'href', pattern: RegPat.regExHRef },
    { name: 'PublicKey', pattern: RegPat.regExPublicKey },
    { name: 'RsaCert', pattern: RegPat.regExCert },
    { name: 'SHA', pattern: RegPat.regExSha },
    { name: 'SpellCheckerDisable', pattern: regExpSpellCheckerDisable },
    { name: 'SpellCheckerDisableBlock', pattern: RegPat.regExSpellingGuardBlock },
    { name: 'SpellCheckerDisableLine', pattern: RegPat.regExSpellingGuardLine },
    { name: 'SpellCheckerDisableNext', pattern: RegPat.regExSpellingGuardNext },
    { name: 'SpellCheckerIgnoreInDocSetting', pattern: RegPat.regExIgnoreSpellingDirectives },
    { name: 'SshRsa', pattern: RegPat.regExSshRSA },
    { name: 'UnicodeRef', pattern: RegPat.regExUnicodeRef },
    { name: 'Urls', pattern: RegPat.regExMatchUrls },
    { name: 'UUID', pattern: RegPat.regExUUID },

    // Include patterns, alphabetically sorted
    { name: 'CStyleComment', pattern: RegPat.regExCStyleComments },
    { name: 'Everything', pattern: '.*' },
    { name: 'PhpHereDoc', pattern: RegPat.regExPhpHereDoc },
    { name: 'string', pattern: RegPat.regExString },
] as const;

type NameType<T> = T extends readonly { name: infer U }[] ? U : never;

type ExtendsType<T, U> = T extends U ? T : never;

type PredefinedPatternNames = ExtendsType<NameType<typeof predefinedPatterns>, PredefinedPatterns>;

const defaultRegExpPatterns: RegExpPatternDefinition[] = [...predefinedPatterns].map(normalizePattern);

// This bit of copying is done to have the complier ensure that the defaults exist.
const ignoreRegExpList: PredefinedPatternNames[] = DEFAULT_IGNORE_REG_EXP_LIST;

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
        ignoreRegExpList,
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
