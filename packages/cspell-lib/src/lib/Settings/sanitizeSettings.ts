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

import type { Handlers } from '../util/clone.js';
import { cloneInto, copy0, copy1, skip } from '../util/clone.js';
import type { CSpellSettingsInternal, CSpellSettingsInternalFinalized } from './internal/index.js';

type CloneableSettings = CSpellSettingsWithSourceTrace | CSpellSettingsInternal | CSpellSettingsInternalFinalized;

type SettingsKeys = keyof CSpellSettingsWithSourceTrace;

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
    return result;
}

const handlers: CSpellSettingsHandlers = {
    $schema: skip,
    __importRef: copyImportRefField,
    __imports: copyImportsField,
    source: copySourceField,

    id: skip,
    version: skip,

    allowCompoundWords: copy1,
    cache: skip,
    caseSensitive: copy1,
    description: skip,
    dictionaries: copy1,
    dictionaryDefinitions: copyDictionaryDefinitions,
    enabled: copy1,
    enabledLanguageIds: copy1,
    enableFiletypes: copy1,
    enabledFileTypes: copy1,
    enableGlobDot: copy1,
    engines: copy1,
    failFast: copy1,
    features: skip,
    files: copyGlobsSettingsFields,
    flagWords: copy1,
    gitignoreRoot: copy1,
    globRoot: copy1,
    ignorePaths: copyGlobsSettingsFields,
    ignoreRegExpList: copy1,
    ignoreWords: copy1,
    ignoreRandomStrings: copy1,
    import: skip,
    includeRegExpList: copy1,
    language: copy1,
    languageId: copy1,
    languageSettings: copyLanguageSettings,
    loadDefaultConfiguration: copy1,
    maxDuplicateProblems: copy1,
    maxFileSize: copy1,
    maxNumberOfProblems: copy1,
    minWordLength: copy1,
    minRandomLength: copy1,
    name: skip,
    noConfigSearch: copy1,
    noSuggestDictionaries: copy1,
    numSuggestions: copy1,
    overrides: copyOverrides,
    patterns: copyPatternsField,
    pnpFiles: skip,
    readonly: skip,
    reporters: skip,
    showStatus: copy1,
    spellCheckDelayMs: copy1,
    suggestionNumChanges: copy1,
    suggestionsTimeout: copy1,
    suggestWords: copy1,
    unknownWords: copy1,
    useGitignore: copy1,
    usePnP: skip,
    userWords: copy1,
    validateDirectives: copy1,
    vfs: skip,
    words: copy1,

    // Experimental
    parser: skip,
};

function getHandlers(): CSpellSettingsHandlers {
    return handlers;
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
    copy0(src, ref, 'error');
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
    allowCompoundWords: copy1,
    caseSensitive: copy1,
    description: skip,
    dictionaries: copy1,
    dictionaryDefinitions: copyDictionaryDefinitions,
    enabled: copy1,
    flagWords: copy1,
    ignoreRegExpList: copy1,
    ignoreWords: copy1,
    includeRegExpList: copy1,
    languageId: copy1,
    name: skip,
    noSuggestDictionaries: copy1,
    patterns: copyPatternsField,
    suggestWords: copy1,
    unknownWords: copy1,
    words: copy1,

    // Experimental
    parser: skip,
};

function copyLanguageSetting(src: Readonly<LanguageSetting>, dst: LanguageSetting): void {
    cloneInto(src, dst, LanguageSettingsHandlers);
}

const RegExpPatternDefinitionHandlers: Handlers<RegExpPatternDefinition> = {
    name: cpy,
    pattern: copy1,
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
        const dst = { pattern: p.pattern, name: p.name };
        copyRegExpPatternDefinition(p, dst);
        return dst;
    });
}

function copyRegExpPatternDefinition(src: Readonly<RegExpPatternDefinition>, dst: RegExpPatternDefinition): void {
    cloneInto(src, dst, RegExpPatternDefinitionHandlers);
}

const OverridesHandlers: Handlers<OverrideSettings> = {
    id: copy1,
    allowCompoundWords: copy1,
    caseSensitive: copy1,
    description: copy1,
    dictionaries: copy1,
    dictionaryDefinitions: copyDictionaryDefinitions,
    enabled: copy1,
    enabledFileTypes: copy1,
    enabledLanguageIds: copy1,
    enableFiletypes: copy1,
    filename: copyGlobsOverrideFields,
    flagWords: copy1,
    ignoreRandomStrings: copy1,
    ignoreRegExpList: copy1,
    ignoreWords: copy1,
    includeRegExpList: copy1,
    language: copy1,
    languageId: copy1,
    languageSettings: copyLanguageSettings,
    loadDefaultConfiguration: copy1,
    maxDuplicateProblems: copy1,
    maxFileSize: copy1,
    maxNumberOfProblems: copy1,
    minRandomLength: copy1,
    minWordLength: copy1,
    name: skip,
    noSuggestDictionaries: copy1,
    numSuggestions: copy1,
    patterns: copyPatternsField,
    pnpFiles: skip,
    suggestionNumChanges: copy1,
    suggestionsTimeout: copy1,
    suggestWords: copy1,
    unknownWords: copy1,
    usePnP: skip,
    words: copy1,

    parser: skip,
};

function copyOverrides(
    src: Readonly<CloneableSettings>,
    dst: CSpellSettingsWithSourceTrace,
    key: Extract<SettingsKeys, 'overrides'>,
): void {
    const overrides = src[key];
    if (!overrides) return;
    dst[key] = overrides.map((src) => {
        const dst = {} as OverrideSettings;
        cloneInto(src, dst, OverridesHandlers);
        return dst;
    });
}
