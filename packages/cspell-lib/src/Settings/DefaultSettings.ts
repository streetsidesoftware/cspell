import {
    CSpellSettings,
    RegExpPatternDefinition,
    CSpellSettingsWithSourceTrace,
    PredefinedPatterns,
} from './CSpellSettingsDef';
import * as LanguageSettings from './LanguageSettings';
import * as RegPat from './RegExpPatterns';
import { readSettings } from './CSpellSettingsServer';
import * as Path from 'path';
import { mergeSettings } from './index';

// cspell:ignore filetypes

const defaultConfigFile = Path.join(__dirname, '..', '..', 'config', 'cspell-default.json');

const regExpSpellCheckerDisable = [
    RegPat.regExSpellingGuardBlock,
    RegPat.regExSpellingGuardLine,
    RegPat.regExSpellingGuardNext,
];

const predefinedPatterns = [
    // Exclude patterns
    { name: 'Urls', pattern: RegPat.regExMatchUrls },
    { name: 'HexDigits', pattern: RegPat.regExHexDigits },
    { name: 'HexValues', pattern: RegPat.regExMatchCommonHexFormats },
    { name: 'SpellCheckerDisable', pattern: regExpSpellCheckerDisable },
    { name: 'PublicKey', pattern: RegPat.regExPublicKey },
    { name: 'RsaCert', pattern: RegPat.regExCert },
    { name: 'EscapeCharacters', pattern: RegPat.regExEscapeCharacters },
    { name: 'Base64', pattern: RegPat.regExBase64 },
    { name: 'Email', pattern: RegPat.regExEmail },
    { name: 'SHA', pattern: RegPat.regExSha },
    { name: 'href', pattern: RegPat.regExHRef },

    // Include Patterns
    { name: 'PhpHereDoc', pattern: RegPat.regExPhpHereDoc },
    { name: 'string', pattern: RegPat.regExString },
    { name: 'CStyleComment', pattern: RegPat.regExCStyleComments },
    { name: 'Everything', pattern: '.*' },
] as const;

type NameType<T> = T extends readonly { name: infer U }[] ? U : never;

type ExtendsType<T, U> = T extends U ? T : never;

type PredefinedPatternNames = ExtendsType<NameType<typeof predefinedPatterns>, PredefinedPatterns>;

const defaultRegExpPatterns: RegExpPatternDefinition[] = [...predefinedPatterns];

const definedDefaultRegExpExcludeList: PredefinedPatterns[] = [
    'SpellCheckerDisable',
    'Urls',
    'Email',
    'PublicKey',
    'RsaCert',
    'Base64',
    'SHA',
];

// This bit of copying is done to have the complier ensure that the defaults exist.
const defaultRegExpExcludeList: PredefinedPatternNames[] = definedDefaultRegExpExcludeList;

export const _defaultSettings: CSpellSettingsWithSourceTrace = {
    id: 'static_defaults',
    language: 'en',
    name: 'Static Defaults',
    enabled: true,
    enabledLanguageIds: [
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
    maxNumberOfProblems: 100,
    numSuggestions: 10,
    words: [],
    userWords: [],
    ignorePaths: [],
    allowCompoundWords: false,
    patterns: defaultRegExpPatterns,
    ignoreRegExpList: defaultRegExpExcludeList,
    languageSettings: LanguageSettings.getDefaultLanguageSettings(),
    source: { name: 'defaultSettings' },
};

const getSettings = (function () {
    let settings: CSpellSettings | undefined = undefined;
    return function () {
        if (!settings) {
            const jsonSettings = readSettings(defaultConfigFile);
            settings = mergeSettings(_defaultSettings, jsonSettings);
            settings.name = jsonSettings.name || settings.name;
        }
        return settings;
    };
})();

export function getDefaultSettings(): CSpellSettings {
    return getSettings();
}
