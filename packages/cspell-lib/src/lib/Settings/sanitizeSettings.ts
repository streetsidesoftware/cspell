import type {
    CSpellSettingsWithSourceTrace,
    DictionaryDefinition,
    Glob,
    ImportFileRef,
    LanguageSetting,
    OverrideSettings,
    RegExpPatternDefinition,
    Source,
} from '@cspell/cspell-types';

import type { CSpellSettingsInternal, CSpellSettingsInternalFinalized } from '../Models/CSpellSettingsInternalDef.js';
import type { Handlers } from './clone.js';
import { cloneInto } from './clone.js';

type CloneableSettings = CSpellSettingsWithSourceTrace | CSpellSettingsInternal | CSpellSettingsInternalFinalized;

type SettingsKeys = keyof CSpellSettingsWithSourceTrace;

type OnlySettingsThatExtend<T> = {
    [key in SettingsKeys]: CSpellSettingsWithSourceTrace[key] extends T ? CSpellSettingsWithSourceTrace[key] : never;
};

type OnlyRecords = OnlySettingsThatExtend<object>;

type OnlyRecordsKeys = keyof OnlyRecords;

type CSpellSettingsHandlers = Handlers<CSpellSettingsWithSourceTrace>;

/**
 * Sanitize settings for export by removing any internal only properties.
 *
 * @param settings - the input settings
 */
export function cloneSettingsForExport(settings: Readonly<CloneableSettings>): CSpellSettingsWithSourceTrace {
    const result: CSpellSettingsWithSourceTrace = {};
    const handlers = getHandlers();
    cloneInto(settings, result, handlers);
    return settings;
}

const handlers: CSpellSettingsHandlers = {
    $schema: skip,
    __importRef: copyImportRefField,
    __imports: copyImportsField,
    source: copySourceField,

    id: skip,
    version: skip,

    allowCompoundWords: copySetting,
    cache: skip,
    caseSensitive: copySetting,
    description: skip,
    dictionaries: copySetting,
    dictionaryDefinitions: copyDictionaryDefinitions,
    enabled: copySetting,
    enabledLanguageIds: copySetting,
    enableFiletypes: copySetting,
    enabledFileTypes: copyRecord,
    enableGlobDot: copySetting,
    failFast: copySetting,
    features: skip,
    files: copyGlobsSettingsFields,
    flagWords: copySetting,
    gitignoreRoot: copySetting,
    globRoot: copySetting,
    ignorePaths: copyGlobsSettingsFields,
    ignoreRegExpList: copySetting,
    ignoreWords: copySetting,
    ignoreRandomStrings: copySetting,
    import: skip,
    includeRegExpList: copySetting,
    language: copySetting,
    languageId: copySetting,
    languageSettings: copyLanguageSettings,
    loadDefaultConfiguration: copySetting,
    maxDuplicateProblems: copySetting,
    maxFileSize: copySetting,
    maxNumberOfProblems: copySetting,
    minWordLength: copySetting,
    minRandomLength: copySetting,
    name: skip,
    noConfigSearch: copySetting,
    noSuggestDictionaries: copySetting,
    numSuggestions: copySetting,
    overrides: copyOverrides,
    patterns: copyPatternsField,
    pnpFiles: skip,
    readonly: skip,
    reporters: skip,
    showStatus: copySetting,
    spellCheckDelayMs: copySetting,
    suggestionNumChanges: copySetting,
    suggestionsTimeout: copySetting,
    suggestWords: copySetting,
    unknownWords: copySetting,
    useGitignore: copySetting,
    usePnP: skip,
    userWords: copySetting,
    validateDirectives: copySetting,
    words: copySetting,

    // Experimental
    parser: skip,
};

function getHandlers(): CSpellSettingsHandlers {
    return handlers;
}

function copySetting<T, K extends keyof T>(src: Readonly<T>, dst: T, key: K): void {
    if (src[key] === undefined) return;
    const value: T[K] | undefined = src[key];
    if (value === undefined) return;

    if (Array.isArray(value)) {
        dst[key] = [...value] as T[K];
        return;
    }

    if (value instanceof Set) {
        dst[key] = new Set(value) as T[K];
        return;
    }

    if (value instanceof Map) {
        dst[key] = new Set(value) as T[K];
        return;
    }

    if (value instanceof RegExp) {
        dst[key] = value;
        return;
    }

    if (typeof value === 'object') {
        dst[key] = { ...value } as T[K];
    }

    dst[key] = value;
}

function copyRecord<K extends OnlyRecordsKeys>(
    src: Readonly<CloneableSettings>,
    dst: CSpellSettingsWithSourceTrace,
    key: K,
): void {
    const value = src[key];
    if (value && typeof value === 'object') {
        dst[key] = { ...value };
    }
}

function skip(
    _src: Readonly<CloneableSettings>,
    _dst: CSpellSettingsWithSourceTrace,
    _key: keyof CSpellSettingsWithSourceTrace,
): void {
    // do nothing
}

function copyImportRefField(
    src: Readonly<CloneableSettings>,
    dst: CSpellSettingsWithSourceTrace,
    key: Extract<SettingsKeys, '__importRef'>,
) {
    const ref = src[key];
    if (!ref) return;
    dst[key] = copyImportFileRef(ref);
}

function copyImportsField(
    src: Readonly<CloneableSettings>,
    dst: CSpellSettingsWithSourceTrace,
    key: Extract<SettingsKeys, '__imports'>,
) {
    const imports = src[key];
    if (!imports) return;
    dst[key] = new Map([...imports.entries()].map(([k, v]) => [k, copyImportFileRef(v)]));
}

function copyImportFileRef(src: ImportFileRef): ImportFileRef {
    const ref: ImportFileRef = { filename: src.filename };
    cpy(src, ref, 'error');
    return ref;
}

function copySourceField(
    src: Readonly<CloneableSettings>,
    dst: CSpellSettingsWithSourceTrace,
    key: Extract<SettingsKeys, 'source'>,
) {
    if (!src[key]) return;
    dst[key] = copySource(src[key]);
}

function copySource(src: Source): Source {
    const source: Source = { name: src.name };
    cpy(src, source, 'filename');
    return source;
}

function copyGlobsSettingsFields(
    src: Readonly<CloneableSettings>,
    dst: CSpellSettingsWithSourceTrace,
    key: Extract<SettingsKeys, 'ignorePaths' | 'files'>,
) {
    const globs = src[key];
    if (!globs) return;
    dst[key] = copyGlobOrGlobs(globs);
}

function copyGlobsOverrideFields(
    src: Readonly<OverrideSettings>,
    dst: OverrideSettings,
    key: Extract<keyof OverrideSettings, 'filename'>,
) {
    const globs = src[key];
    if (!globs) return;
    dst[key] = copyGlobOrGlobs(globs);
}

function copyGlobOrGlobs(globOrGlobs: Glob[]): Glob[];
function copyGlobOrGlobs(globOrGlobs: Glob): Glob;
function copyGlobOrGlobs(globOrGlobs: Glob | Glob[]): Glob | Glob[];
function copyGlobOrGlobs(globOrGlobs: Glob | Glob[]): Glob | Glob[] {
    if (Array.isArray(globOrGlobs)) {
        return globOrGlobs.map(copyGlob);
    }
    return copyGlob(globOrGlobs);
}

function copyGlob(glob: Glob): Glob {
    if (typeof glob === 'string') {
        return glob;
    }
    const g: Glob = { glob: glob.glob };
    cpy(glob, g, 'root');
    return g;
}

function copyDictionaryDefinitions(
    src: CloneableSettings,
    dst: CSpellSettingsWithSourceTrace,
    key: Extract<SettingsKeys, 'dictionaryDefinitions'>,
): void {
    const defs = src[key];
    if (!defs) return;
    dst[key] = defs.map(copyDictionaryDefinition);
}

function copyDictionaryDefinition(src: DictionaryDefinition): DictionaryDefinition {
    const def: DictionaryDefinition = { name: src.name };
    cpy(src, def, 'path');
    cpy(src, def, 'type');
    cpy(src, def, 'description');
    return def;
}

function copyLanguageSettings(
    src: Readonly<CloneableSettings>,
    dst: CSpellSettingsWithSourceTrace,
    key: Extract<SettingsKeys, 'languageSettings'>,
): void {
    const langSettings = src[key];
    if (!langSettings) return;
    dst[key] = langSettings.map((src) => {
        const dst: LanguageSetting = { languageId: src.languageId };
        copyLanguageSetting(src, dst);
        return dst;
    });
}

function cpy<T, K extends keyof T>(src: T, dst: T, key: K): void {
    const value = src[key];
    if (value === undefined) return;
    dst[key] = value;
}

const LanguageSettingsHandlers: Handlers<LanguageSetting> = {
    id: cpy,
    locale: cpy,
    local: cpy,
    allowCompoundWords: copySetting,
    caseSensitive: copySetting,
    description: skip,
    dictionaries: copySetting,
    dictionaryDefinitions: copyDictionaryDefinitions,
    enabled: copySetting,
    flagWords: copySetting,
    ignoreRegExpList: copySetting,
    ignoreWords: copySetting,
    includeRegExpList: copySetting,
    languageId: copySetting,
    name: skip,
    noSuggestDictionaries: copySetting,
    patterns: copyPatternsField,
    suggestWords: copySetting,
    unknownWords: copySetting,
    words: copySetting,

    // Experimental
    parser: skip,
};

function copyLanguageSetting(src: Readonly<LanguageSetting>, dst: LanguageSetting): void {
    cloneInto(src, dst, LanguageSettingsHandlers);
}

const RegExpPatternDefinitionHandlers: Handlers<RegExpPatternDefinition> = {
    name: cpy,
    pattern: copySetting,
    description: cpy,
};

function copyPatternsField(
    src: Readonly<CloneableSettings>,
    dst: CSpellSettingsWithSourceTrace,
    key: Extract<SettingsKeys, 'patterns'>,
): void {
    const patterns = src[key];
    if (!patterns) return;
    dst[key] = patterns.map((p) => {
        copyRegExpPatternDefinition(p, { pattern: p.pattern, name: p.name });
        return p;
    });
}

function copyRegExpPatternDefinition(src: Readonly<RegExpPatternDefinition>, dst: RegExpPatternDefinition): void {
    cloneInto(src, dst, RegExpPatternDefinitionHandlers);
}

const OverridesHandlers: Handlers<OverrideSettings> = {
    id: copySetting,
    allowCompoundWords: copySetting,
    caseSensitive: copySetting,
    description: copySetting,
    dictionaries: copySetting,
    dictionaryDefinitions: copyDictionaryDefinitions,
    enabled: copySetting,
    enabledFileTypes: copyRecord,
    enabledLanguageIds: copySetting,
    enableFiletypes: copySetting,
    filename: copyGlobsOverrideFields,
    flagWords: copySetting,
    ignoreRandomStrings: copySetting,
    ignoreRegExpList: copySetting,
    ignoreWords: copySetting,
    includeRegExpList: copySetting,
    language: copySetting,
    languageId: copySetting,
    languageSettings: copyLanguageSettings,
    loadDefaultConfiguration: copySetting,
    maxDuplicateProblems: copySetting,
    maxFileSize: copySetting,
    maxNumberOfProblems: copySetting,
    minRandomLength: copySetting,
    minWordLength: copySetting,
    name: skip,
    noSuggestDictionaries: copySetting,
    numSuggestions: copySetting,
    patterns: copyPatternsField,
    pnpFiles: skip,
    suggestionNumChanges: copySetting,
    suggestionsTimeout: copySetting,
    suggestWords: copySetting,
    unknownWords: copySetting,
    usePnP: skip,
    words: copySetting,

    parser: skip,
};

function copyOverrides(
    src: Readonly<CloneableSettings>,
    dst: CSpellSettingsWithSourceTrace,
    key: Extract<SettingsKeys, 'overrides'>,
): void {
    const overrides = src[key];
    if (!overrides) return;
    dst[key] = overrides.map((o) => {
        cloneInto(o, { filename: o.filename }, OverridesHandlers);
        return o;
    });
}
