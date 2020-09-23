import { CSpellSettings, RegExpPatternDefinition, DictionaryDefinition, CSpellSettingsWithSourceTrace } from './CSpellSettingsDef';
import * as LanguageSettings from './LanguageSettings';
import * as RegPat from './RegExpPatterns';
import { readSettings } from './CSpellSettingsServer';
import * as Path from 'path';
import { mergeSettings } from './index';

// cspell:ignore filetypes

const defaultRegExpExcludeList = [
    'SpellCheckerDisable',
    'Urls',
    'Email',
    'PublicKey',
    'RsaCert',
    'Base64',
    'SHA',
];

const defaultConfigFile = Path.join(__dirname, '..', '..', 'config', 'cspell-default.json');

const defaultRegExpPatterns: RegExpPatternDefinition[] = [
    // Exclude patterns
    { name: 'Urls',                 pattern: RegPat.regExMatchUrls },
    { name: 'HexDigits',            pattern: RegPat.regExHexDigits },
    { name: 'HexValues',            pattern: RegPat.regExMatchCommonHexFormats },
    { name: 'SpellCheckerDisable',  pattern: RegPat.regExSpellingGuard },
    { name: 'PublicKey',            pattern: RegPat.regExPublicKey },
    { name: 'RsaCert',              pattern: RegPat.regExCert },
    { name: 'EscapeCharacters',     pattern: RegPat.regExEscapeCharacters },
    { name: 'Base64',               pattern: RegPat.regExBase64 },
    { name: 'Email',                pattern: RegPat.regExEmail },
    { name: 'SHA',                  pattern: RegPat.regExSha },
    { name: 'href',                 pattern: RegPat.regExHRef },

    // Include Patterns
    { name: 'PhpHereDoc',           pattern: RegPat.regExPhpHereDoc },
    { name: 'string',               pattern: RegPat.regExString },
    { name: 'CStyleComment',        pattern: RegPat.regExCStyleComments },
    { name: 'Everything',           pattern: '.*' },
];

const defaultDictionaryDefs: DictionaryDefinition[] = [
    { name: 'css',            file: 'css.txt.gz',           type: 'S', description: 'CSS Keywords.' },
    { name: 'csharp',         file: 'csharp.txt.gz',        type: 'S', description: 'C# Keywords and common library functions.' },
    { name: 'filetypes',      file: 'filetypes.txt.gz',     type: 'S', description: 'List of file types.' },
    { name: 'html',           file: 'html.txt.gz',          type: 'S', description: 'HTML keywords.' },
    { name: 'misc',           file: 'miscTerms.txt.gz',     type: 'S', description: 'List of miscellaneous terms.' },
    { name: 'node',           file: 'node.txt.gz',          type: 'S', description: 'List of NodeJS terms.' },
    { name: 'npm',            file: 'npm.txt.gz',           type: 'S', description: 'List of Top 500 NPM packages.' },
];


export const _defaultSettings: CSpellSettingsWithSourceTrace = {
    id: 'static_defaults',
    language: 'en',
    name: 'Static Defaults',
    enabled: true,
    enabledLanguageIds: [
        'csharp', 'go', 'javascript', 'javascriptreact', 'json', 'markdown', 'mdx',
        'php', 'plaintext', 'python', 'text', 'typescript', 'typescriptreact',
        'html', 'css', 'less', 'scss',
        'latex', 'ruby', 'rust', 'shellscript', 'toml'
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
    dictionaryDefinitions: defaultDictionaryDefs,
    source: {name: 'defaultSettings'},
};

const getSettings = function() {
    let settings: CSpellSettings | undefined = undefined;
    return function() {
        if (!settings) {
            const jsonSettings = readSettings(defaultConfigFile);
            settings = mergeSettings(_defaultSettings, jsonSettings);
            settings.name = jsonSettings.name || settings.name;
        }
        return settings!;
    };
}();

export function getDefaultSettings(): CSpellSettings {
    return getSettings();
}
