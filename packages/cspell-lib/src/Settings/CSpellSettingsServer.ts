import type {
    CSpellSettingsWithSourceTrace,
    CSpellUserSettings,
    Glob,
    GlobDef,
    ImportFileRef,
    LanguageSetting,
    PnPSettings,
    ReporterSettings,
    Source,
} from '@cspell/cspell-types';
import * as json from 'comment-json';
import { cosmiconfig, cosmiconfigSync, Options as CosmicOptions, OptionsSync as CosmicOptionsSync } from 'cosmiconfig';
import { GlobMatcher } from 'cspell-glob';
import * as path from 'path';
import { URI } from 'vscode-uri';
import { logError, logWarning } from '../util/logger';
import { resolveFile } from '../util/resolveFile';
import * as util from '../util/util';
import {
    createCSpellSettingsInternal as csi,
    CSpellSettingsInternal,
    isCSpellSettingsInternal,
} from './CSpellSettingsInternalDef';
import { calcDictionaryDefsToLoad, normalizePathForDictDefs } from './DictionarySettings';
import { getRawGlobalSettings } from './GlobalSettings';
import { ImportError } from './ImportError';
import { resolvePatterns } from './patterns';
import { LoaderResult, pnpLoader } from './pnpLoader';

type CSpellSettingsWST = CSpellSettingsWithSourceTrace;
type CSpellSettingsI = CSpellSettingsInternal;
type CSpellSettingsVersion = Exclude<CSpellUserSettings['version'], undefined>;

const supportedCSpellConfigVersions: CSpellSettingsVersion[] = ['0.2'];
const configSettingsFileVersion0_1 = '0.1';
const configSettingsFileVersion0_2 = '0.2';
export const currentSettingsFileVersion = configSettingsFileVersion0_2;

const setOfSupportedConfigVersions = new Set<string>(supportedCSpellConfigVersions);

export const sectionCSpell = 'cSpell';

export const defaultFileName = 'cspell.json';

export const ENV_CSPELL_GLOB_ROOT = 'CSPELL_GLOB_ROOT';

/**
 * Logic of the locations:
 * - Support backward compatibility with the VS Code Spell Checker
 *   the spell checker extension can only write to `.json` files because
 *   it would be too difficult to automatically modify a `.js` or `.cjs` file.
 * - To support `cspell.config.js` in a VS Code environment, have a `cspell.json` import
 *   the `cspell.config.js`.
 */
const searchPlaces = [
    'package.json',
    // Original locations
    '.cspell.json',
    'cspell.json',
    '.cSpell.json',
    'cSpell.json',
    // Original locations jsonc
    '.cspell.jsonc',
    'cspell.jsonc',
    // Alternate locations
    '.vscode/cspell.json',
    '.vscode/cSpell.json',
    '.vscode/.cspell.json',
    // Standard Locations
    'cspell.config.json',
    'cspell.config.jsonc',
    'cspell.config.yaml',
    'cspell.config.yml',
    'cspell.yaml',
    'cspell.yml',
    // Dynamic config is looked for last
    'cspell.config.js',
    'cspell.config.cjs',
];

const cspellCosmiconfig: CosmicOptions & CosmicOptionsSync = {
    searchPlaces,
    loaders: {
        '.json': parseJson,
        '.jsonc': parseJson,
    },
};

function parseJson(_filename: string, content: string) {
    return json.parse(content);
}

export const defaultConfigFilenames = Object.freeze(searchPlaces.concat());

const cspellConfigExplorer = cosmiconfig('cspell', cspellCosmiconfig);
const cspellConfigExplorerSync = cosmiconfigSync('cspell', cspellCosmiconfig);

const defaultSettings: CSpellSettingsI = csi({
    id: 'default',
    name: 'default',
    version: currentSettingsFileVersion,
});

const defaultPnPSettings: PnPSettings = {};

let globalSettings: CSpellSettingsI | undefined;

const cachedFiles = new Map<string, CSpellSettingsI>();

/**
 * Read a config file and inject the fileRef.
 * @param fileRef - filename plus context, injected into the resulting config.
 */
function readConfig(fileRef: ImportFileRef): CSpellSettingsWST {
    // cspellConfigExplorerSync
    const { filename } = fileRef;
    const s: CSpellSettingsWST = {};
    try {
        const r = cspellConfigExplorerSync.load(filename);
        if (!r?.config) throw new Error(`not found: "${filename}"`);
        Object.assign(s, r.config);
        normalizeRawConfig(s);
        validateRawConfig(s, fileRef);
    } catch (err) {
        fileRef.error =
            err instanceof ImportError ? err : new ImportError(`Failed to read config file: "${filename}"`, err);
    }
    s.__importRef = fileRef;
    return s;
}

/**
 * normalizeSettings handles correcting all relative paths, anchoring globs, and importing other config files.
 * @param rawSettings - raw configuration settings
 * @param pathToSettingsFile - path to the source file of the configuration settings.
 */
function normalizeSettings(
    rawSettings: CSpellSettingsWST,
    pathToSettingsFile: string,
    pnpSettings: PnPSettings
): CSpellSettingsI {
    const id =
        rawSettings.id ||
        [path.basename(path.dirname(pathToSettingsFile)), path.basename(pathToSettingsFile)].join('/');
    const name = rawSettings.name || id;

    // Try to load any .pnp files before reading dictionaries or other config files.
    const { usePnP = pnpSettings.usePnP, pnpFiles = pnpSettings.pnpFiles } = rawSettings;
    const pnpSettingsToUse: PnPSettings = {
        usePnP,
        pnpFiles,
    };
    const pathToSettingsDir = path.dirname(pathToSettingsFile);
    loadPnPSync(pnpSettingsToUse, URI.file(pathToSettingsDir));

    // Fix up dictionaryDefinitions
    const settings = {
        version: defaultSettings.version,
        ...rawSettings,
        id,
        name,
        globRoot: resolveGlobRoot(rawSettings, pathToSettingsFile),
        languageSettings: normalizeLanguageSettings(rawSettings.languageSettings),
    };
    const pathToSettings = path.dirname(pathToSettingsFile);
    const normalizedDictionaryDefs = normalizeDictionaryDefs(settings, pathToSettingsFile);
    const normalizedSettingsGlobs = normalizeSettingsGlobs(settings, pathToSettingsFile);
    const normalizedOverrides = normalizeOverrides(settings, pathToSettingsFile);
    const normalizedReporters = normalizeReporters(settings, pathToSettingsFile);
    const normalizedGitignoreRoot = normalizeGitignoreRoot(settings, pathToSettingsFile);
    const normalizedCacheSettings = normalizeCacheSettings(settings, pathToSettingsDir);

    const imports = typeof settings.import === 'string' ? [settings.import] : settings.import || [];
    const source: Source = settings.source || {
        name: settings.name,
        filename: pathToSettingsFile,
    };

    const fileSettings: CSpellSettingsI = csi({
        ...settings,
        source,
        ...normalizedDictionaryDefs,
        ...normalizedSettingsGlobs,
        ...normalizedOverrides,
        ...normalizedReporters,
        ...normalizedGitignoreRoot,
        ...normalizedCacheSettings,
    });
    if (!imports.length) {
        return fileSettings;
    }
    const importedSettings: CSpellSettingsI = imports
        .map((name) => resolveFilename(name, pathToSettings))
        .map((ref) => ((ref.referencedBy = [source]), ref))
        .map((ref) => importSettings(ref, undefined, pnpSettingsToUse))
        .reduce((a, b) => mergeSettings(a, b));
    const finalizeSettings = mergeSettings(importedSettings, fileSettings);
    finalizeSettings.name = settings.name || finalizeSettings.name || '';
    finalizeSettings.id = settings.id || finalizeSettings.id || '';
    return finalizeSettings;
}

function mergeSourceList(orig: Source[], append: Source[] | undefined): Source[] {
    const collection = new Map(orig.map((s) => [s.name + (s.filename || ''), s]));

    for (const s of append || []) {
        const key = s.name + (s.filename || '');
        if (!collection.has(key)) {
            collection.set(key, s);
        }
    }

    return [...collection.values()];
}

function importSettings(
    fileRef: ImportFileRef,
    defaultValues: CSpellSettingsWST | undefined,
    pnpSettings: PnPSettings
): CSpellSettingsI {
    defaultValues = defaultValues ?? defaultSettings;
    let { filename } = fileRef;
    filename = path.resolve(filename);
    const importRef: ImportFileRef = { ...fileRef, filename };
    const cached = cachedFiles.get(filename);
    if (cached) {
        const cachedImportRef = cached.__importRef || importRef;
        cachedImportRef.referencedBy = mergeSourceList(cachedImportRef.referencedBy || [], importRef.referencedBy);
        cached.__importRef = cachedImportRef;
        return cached;
    }
    const id = [path.basename(path.dirname(filename)), path.basename(filename)].join('/');
    const name = id;
    const finalizeSettings: CSpellSettingsI = csi({ id, name, __importRef: importRef });
    cachedFiles.set(filename, finalizeSettings); // add an empty entry to prevent circular references.
    const settings: CSpellSettingsWST = { ...defaultValues, id, name, ...readConfig(importRef) };

    Object.assign(finalizeSettings, normalizeSettings(settings, filename, pnpSettings));
    const finalizeSrc: Source = { name: path.basename(filename), ...finalizeSettings.source };
    finalizeSettings.source = { ...finalizeSrc, filename };
    cachedFiles.set(filename, finalizeSettings);
    return finalizeSettings;
}

export function readSettings(filename: string): CSpellSettingsI;
export function readSettings(filename: string, defaultValues: CSpellSettingsWST): CSpellSettingsI;
export function readSettings(filename: string, relativeTo: string): CSpellSettingsI;
export function readSettings(filename: string, relativeTo: string, defaultValues: CSpellSettingsWST): CSpellSettingsI;
export function readSettings(
    filename: string,
    relativeToOrDefault?: CSpellSettingsWST | string,
    defaultValue?: CSpellSettingsWST
): CSpellSettingsI {
    const relativeTo = typeof relativeToOrDefault === 'string' ? relativeToOrDefault : process.cwd();
    defaultValue = defaultValue || (typeof relativeToOrDefault !== 'string' ? relativeToOrDefault : undefined);
    const ref = resolveFilename(filename, relativeTo);
    return importSettings(ref, defaultValue, defaultValue || defaultPnPSettings);
}

interface SearchForConfigResult {
    config: CSpellSettingsI | undefined;
    filepath: string;
    isEmpty?: boolean;
}

interface NormalizeSearchForConfigResult {
    config: CSpellSettingsI;
    filepath: string | undefined;
    error: ImportError | undefined;
}

async function normalizeSearchForConfigResult(
    searchPath: string,
    searchResult: Promise<SearchForConfigResult | null>,
    pnpSettings: PnPSettings
): Promise<NormalizeSearchForConfigResult> {
    let result: SearchForConfigResult | undefined;
    let error: ImportError | undefined;
    try {
        result = (await searchResult) || undefined;
    } catch (cause) {
        error = new ImportError(`Failed to find config file at: "${searchPath}"`, cause);
    }

    const filepath = result?.filepath;
    if (filepath) {
        const cached = cachedFiles.get(filepath);
        if (cached) {
            return {
                config: cached,
                filepath,
                error,
            };
        }
    }

    const { config = csi({}) } = result || {};
    const filename = result?.filepath ?? searchPath;
    const importRef: ImportFileRef = { filename: filename, error };

    const id = [path.basename(path.dirname(filename)), path.basename(filename)].join('/');
    const name = result?.filepath ? id : `Config not found: ${id}`;
    const finalizeSettings: CSpellSettingsI = csi({ id, name, __importRef: importRef });
    const settings: CSpellSettingsI = { id, ...config };
    cachedFiles.set(filename, finalizeSettings); // add an empty entry to prevent circular references.
    Object.assign(finalizeSettings, normalizeSettings(settings, filename, pnpSettings));

    return {
        config: finalizeSettings,
        filepath,
        error,
    };
}

export function searchForConfig(
    searchFrom: string | undefined,
    pnpSettings: PnPSettings = defaultPnPSettings
): Promise<CSpellSettingsI | undefined> {
    return normalizeSearchForConfigResult(
        searchFrom || process.cwd(),
        cspellConfigExplorer.search(searchFrom),
        pnpSettings
    ).then((r) => (r.filepath ? r.config : undefined));
}

/**
 * Load a CSpell configuration files.
 * @param file - path or package reference to load.
 * @param pnpSettings - PnP settings
 * @returns normalized CSpellSettings
 */
export function loadConfig(file: string, pnpSettings: PnPSettings = defaultPnPSettings): Promise<CSpellSettingsI> {
    const cached = cachedFiles.get(path.resolve(file));
    if (cached) {
        return Promise.resolve(cached);
    }
    return normalizeSearchForConfigResult(file, cspellConfigExplorer.load(file), pnpSettings).then((r) => r.config);
}

export function loadPnP(pnpSettings: PnPSettings, searchFrom: URI): Promise<LoaderResult> {
    if (!pnpSettings.usePnP) {
        return Promise.resolve(undefined);
    }
    const loader = pnpLoader(pnpSettings.pnpFiles);
    return loader.load(searchFrom);
}

export function loadPnPSync(pnpSettings: PnPSettings, searchFrom: URI): LoaderResult {
    if (!pnpSettings.usePnP) {
        return undefined;
    }
    const loader = pnpLoader(pnpSettings.pnpFiles);
    return loader.loadSync(searchFrom);
}

export function readRawSettings(filename: string, relativeTo?: string): CSpellSettingsWST {
    relativeTo = relativeTo || process.cwd();
    const ref = resolveFilename(filename, relativeTo);
    return readConfig(ref);
}

/**
 *
 * @param filenames - settings files to read
 * @returns combined configuration
 * @deprecated true
 */
export function readSettingsFiles(filenames: string[]): CSpellSettingsI {
    return filenames.map((filename) => readSettings(filename)).reduce((a, b) => mergeSettings(a, b), defaultSettings);
}

/**
 * Merges two lists and removes duplicates.  Order is NOT preserved.
 */
function mergeListUnique(left: undefined, right: undefined): undefined;
function mergeListUnique<T>(left: T[], right: T[]): T[];
function mergeListUnique<T>(left: undefined, right: T[]): T[];
function mergeListUnique<T>(left: T[], right: undefined): T[];
function mergeListUnique<T>(left: T[] | undefined, right: T[] | undefined): T[] | undefined;
function mergeListUnique<T>(left: T[] | undefined, right: T[] | undefined): T[] | undefined {
    if (left === undefined) return right;
    if (right === undefined) return left;
    const uniqueItems = new Set([...left, ...right]);
    return [...uniqueItems.keys()];
}

/**
 * Merges two lists.
 * Order is preserved.
 */
function mergeList(left: undefined, right: undefined): undefined;
function mergeList<T>(left: T[], right: T[]): T[];
function mergeList<T>(left: undefined, right: T[]): T[];
function mergeList<T>(left: T[], right: undefined): T[];
function mergeList<T>(left: T[] | undefined, right: T[] | undefined): T[] | undefined;
function mergeList<T>(left: T[] | undefined, right: T[] | undefined): T[] | undefined {
    if (left === undefined) return right;
    if (right === undefined) return left;
    return left.concat(right);
}

function mergeObjects(left: undefined, right: undefined): undefined;
function mergeObjects<T>(left: T, right: undefined): T;
function mergeObjects<T>(left: T, right: T): T;
function mergeObjects<T>(left: undefined, right: T): T;
function mergeObjects<T>(left?: T, right?: T): T | undefined {
    if (left === undefined) return right;
    if (right === undefined) return left;
    return { ...left, ...right };
}

function tagLanguageSettings(tag: string, settings: LanguageSetting[] = []): LanguageSetting[] {
    return settings.map((s) => ({
        id: tag + '.' + (s.id || s.locale || s.languageId),
        ...s,
    }));
}

function replaceIfNotEmpty<T>(left: Array<T> = [], right: Array<T> = []) {
    const filtered = right.filter((a) => !!a);
    if (filtered.length) {
        return filtered;
    }
    return left;
}

export function mergeSettings(
    left: CSpellSettingsWST | CSpellSettingsI,
    ...settings: (CSpellSettingsWST | CSpellSettingsI)[]
): CSpellSettingsI {
    const rawSettings = settings.reduce<CSpellSettingsI>(merge, toInternalSettings(left));
    return util.clean(rawSettings);
}

// eslint-disable-next-line @typescript-eslint/ban-types
function isEmpty(obj: Object) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}

function merge(left: CSpellSettingsWST | CSpellSettingsI, right: CSpellSettingsWST | CSpellSettingsI): CSpellSettingsI {
    const _left = toInternalSettings(left);
    const _right = toInternalSettings(right);
    if (left === right) {
        return _left;
    }
    if (isEmpty(right)) {
        return _left;
    }
    if (isEmpty(left)) {
        return _right;
    }
    if (isLeftAncestorOfRight(_left, _right)) {
        return _right;
    }
    if (doesLeftHaveRightAncestor(_left, _right)) {
        return _left;
    }
    const leftId = _left.id || _left.languageId || '';
    const rightId = _right.id || _right.languageId || '';

    const includeRegExpList = takeRightOtherwiseLeft(_left.includeRegExpList, _right.includeRegExpList);

    const optionals = includeRegExpList?.length ? { includeRegExpList } : {};
    const version = max(_left.version, _right.version);

    const settings = csi({
        ..._left,
        ..._right,
        ...optionals,
        version,
        id: [leftId, rightId].join('|'),
        name: [_left.name || '', _right.name || ''].join('|'),
        words: mergeList(_left.words, _right.words),
        userWords: mergeList(_left.userWords, _right.userWords),
        flagWords: mergeListUnique(_left.flagWords, _right.flagWords),
        ignoreWords: mergeListUnique(_left.ignoreWords, _right.ignoreWords),
        enabledLanguageIds: replaceIfNotEmpty(_left.enabledLanguageIds, _right.enabledLanguageIds),
        enableFiletypes: mergeList(_left.enableFiletypes, _right.enableFiletypes),
        ignoreRegExpList: mergeListUnique(_left.ignoreRegExpList, _right.ignoreRegExpList),
        patterns: mergeListUnique(_left.patterns, _right.patterns),
        dictionaryDefinitions: mergeListUnique(_left.dictionaryDefinitions, _right.dictionaryDefinitions),
        dictionaries: mergeListUnique(_left.dictionaries, _right.dictionaries),
        noSuggestDictionaries: mergeListUnique(_left.noSuggestDictionaries, _right.noSuggestDictionaries),
        languageSettings: mergeList(
            tagLanguageSettings(leftId, _left.languageSettings),
            tagLanguageSettings(rightId, _right.languageSettings)
        ),
        enabled: _right.enabled !== undefined ? _right.enabled : _left.enabled,
        files: mergeListUnique(_left.files, _right.files),
        ignorePaths: versionBasedMergeList(_left.ignorePaths, _right.ignorePaths, version),
        overrides: versionBasedMergeList(_left.overrides, _right.overrides, version),
        features: mergeObjects(_left.features, _right.features),
        source: mergeSources(_left, _right),
        description: undefined,
        globRoot: undefined,
        import: undefined,
        __imports: mergeImportRefs(_left, _right),
        __importRef: undefined,
    });
    return settings;
}

function versionBasedMergeList<T>(
    left: T[] | undefined,
    right: T[] | undefined,
    version: CSpellUserSettings['version']
): T[] | undefined {
    if (version === configSettingsFileVersion0_1) {
        return takeRightOtherwiseLeft(left, right);
    }
    return mergeListUnique(left, right);
}

/**
 * Check to see if left is a left ancestor of right.
 * If that is the case, merging is not necessary:
 * @param left - setting on the left side of a merge
 * @param right - setting on the right side of a merge
 */
function isLeftAncestorOfRight(left: CSpellSettingsWST, right: CSpellSettingsWST): boolean {
    return hasAncestor(right, left, 0);
}

/**
 * Check to see if left has right as an ancestor to the right.
 * If that is the case, merging is not necessary:
 * @param left - setting on the left side of a merge
 * @param right - setting on the right side of a merge
 */
function doesLeftHaveRightAncestor(left: CSpellSettingsWST, right: CSpellSettingsWST): boolean {
    return hasAncestor(left, right, 1);
}

function hasAncestor(s: CSpellSettingsWST, ancestor: CSpellSettingsWST, side: number): boolean {
    const sources = s.source?.sources;
    if (!sources) return false;
    // calc the first or last index of the source array.
    const i = side ? sources.length - 1 : 0;
    const src = sources[i];
    return src === ancestor || (src && hasAncestor(src, ancestor, side)) || false;
}

export function mergeInDocSettings(left: CSpellSettingsWST, right: CSpellSettingsWST): CSpellSettingsWST {
    const merged = {
        ...mergeSettings(left, right),
        includeRegExpList: mergeListUnique(left.includeRegExpList, right.includeRegExpList),
    };
    return merged;
}

/**
 * If right is non-empty return right, otherwise return left.
 * @param left - left hand values
 * @param right - right hand values
 */
function takeRightOtherwiseLeft(left: undefined, right: undefined): undefined;
function takeRightOtherwiseLeft<T>(left: T[], right: undefined): T[];
function takeRightOtherwiseLeft<T>(left: undefined, right: T[]): T[];
function takeRightOtherwiseLeft<T>(left: T[] | undefined, right: T[] | undefined): T[] | undefined;
function takeRightOtherwiseLeft<T>(left: T[] | undefined, right: T[] | undefined): T[] | undefined {
    if (right?.length) {
        return right;
    }
    return left || right;
}

export function calcOverrideSettings(settings: CSpellSettingsWST, filename: string): CSpellSettingsI {
    const _settings = toInternalSettings(settings);
    const overrides = _settings.overrides || [];

    const result = overrides
        .filter((override) => checkFilenameMatchesGlob(filename, override.filename))
        .reduce((settings, override) => mergeSettings(settings, override), _settings);
    return result;
}

/**
 *
 * @param settings - settings to finalize
 * @returns settings where all globs and file paths have been resolved.
 */
export function finalizeSettings(settings: CSpellSettingsWST | CSpellSettingsI): CSpellSettingsI {
    return _finalizeSettings(toInternalSettings(settings));
}

function _finalizeSettings(settings: CSpellSettingsI): CSpellSettingsI {
    // apply patterns to any RegExpLists.

    const finalized: CSpellSettingsI = {
        ...settings,
        ignoreRegExpList: resolvePatterns(settings.ignoreRegExpList, settings.patterns),
        includeRegExpList: resolvePatterns(settings.includeRegExpList, settings.patterns),
    };

    finalized.name = 'Finalized ' + (finalized.name || '');
    finalized.source = { name: settings.name || 'src', sources: [settings] };

    return finalized;
}

export function toInternalSettings(settings: undefined): undefined;
export function toInternalSettings(settings: CSpellSettingsI | CSpellSettingsWST): CSpellSettingsI;
export function toInternalSettings(settings?: CSpellSettingsI | CSpellSettingsWST): CSpellSettingsI | undefined;
export function toInternalSettings(settings?: CSpellSettingsI | CSpellSettingsWST): CSpellSettingsI | undefined {
    if (settings === undefined) return undefined;
    if (isCSpellSettingsInternal(settings)) return settings;

    const { dictionaryDefinitions: defs, ...rest } = settings;

    const dictionaryDefinitions = normalizePathForDictDefs(
        defs,
        filenameToDirectory(settings.source?.filename) || resolveCwd()
    );
    const setting = dictionaryDefinitions ? { ...rest, dictionaryDefinitions } : rest;
    return csi(setting);
}

function filenameToDirectory(filename: string | undefined): string | undefined {
    return filename ? path.dirname(filename) : undefined;
}

function resolveFilename(filename: string, relativeTo: string): ImportFileRef {
    const r = resolveFile(filename, relativeTo);

    return {
        filename: r.filename,
        error: r.found ? undefined : new Error(`Failed to resolve file: "${filename}"`),
    };
}

export function getGlobalSettings(): CSpellSettingsI {
    if (!globalSettings) {
        const globalConf = getRawGlobalSettings();

        globalSettings = {
            id: 'global_config',
            ...normalizeSettings(globalConf || {}, './global_config', {}),
        };
    }
    return globalSettings;
}

export function getCachedFileSize(): number {
    return cachedFiles.size;
}

export function clearCachedSettingsFiles(): void {
    globalSettings = undefined;
    cachedFiles.clear();
    cspellConfigExplorer.clearCaches();
    cspellConfigExplorerSync.clearCaches();
}

/**
 * @param filename - filename
 * @param globs - globs
 * @returns true if it matches
 * @deprecated true
 * @deprecationMessage No longer actively supported. Use package: `cspell-glob`.
 */
export function checkFilenameMatchesGlob(filename: string, globs: Glob | Glob[]): boolean {
    const m = new GlobMatcher(globs);
    return m.match(filename);
}

function mergeSources(left: CSpellSettingsWST, right: CSpellSettingsWST): Source {
    const { source: a = { name: 'left' } } = left;
    const { source: b = { name: 'right' } } = right;
    return {
        name: [left.name || a.name, right.name || b.name].join('|'),
        sources: [left, right],
    };
}

function max(a: undefined, b: undefined): undefined;
function max<T>(a: T, b: undefined): T;
function max<T>(a: undefined, b: T): T;
function max<T>(a: T | undefined, b: T | undefined): T | undefined;
function max<T>(a: T | undefined, b: T | undefined): T | undefined {
    if (a === undefined) return b;
    if (b === undefined) return a;
    return a > b ? a : b;
}

/**
 * Return a list of Setting Sources used to create this Setting.
 * @param settings the settings to search
 */
export function getSources(settings: CSpellSettingsWST): CSpellSettingsWST[] {
    const visited = new Set<CSpellSettingsWST>();
    const sources: CSpellSettingsWST[] = [];

    function _walkSourcesTree(settings: CSpellSettingsWST | undefined): void {
        if (!settings || visited.has(settings)) return;
        visited.add(settings);
        if (!settings.source?.sources?.length) {
            sources.push(settings);
            return;
        }
        settings.source.sources.forEach(_walkSourcesTree);
    }

    _walkSourcesTree(settings);

    return sources;
}

type Imports = CSpellSettingsWST['__imports'];

function mergeImportRefs(left: CSpellSettingsWST, right: CSpellSettingsWST = {}): Imports {
    const imports = new Map(left.__imports || []);
    if (left.__importRef) {
        imports.set(left.__importRef.filename, left.__importRef);
    }
    if (right.__importRef) {
        imports.set(right.__importRef.filename, right.__importRef);
    }
    const rightImports = right.__imports?.values() || [];
    for (const ref of rightImports) {
        imports.set(ref.filename, ref);
    }
    return imports.size ? imports : undefined;
}

export interface ImportFileRefWithError extends ImportFileRef {
    error: Error;
}

function isImportFileRefWithError(ref: ImportFileRef): ref is ImportFileRefWithError {
    return !!ref.error;
}

export function extractImportErrors(settings: CSpellSettingsWST): ImportFileRefWithError[] {
    const imports = mergeImportRefs(settings);
    return !imports ? [] : [...imports.values()].filter(isImportFileRefWithError);
}

export interface ConfigurationDependencies {
    configFiles: string[];
    dictionaryFiles: string[];
}

export function extractDependencies(settings: CSpellSettingsWST | CSpellSettingsI): ConfigurationDependencies {
    const settingsI = toInternalSettings(settings);
    const configFiles = [...(mergeImportRefs(settingsI) || [])].map(([filename]) => filename);
    const dictionaryFiles = calcDictionaryDefsToLoad(settingsI).map((dict) => dict.path);

    return {
        configFiles,
        dictionaryFiles,
    };
}

function resolveCwd(): string {
    const envGlobRoot = process.env[ENV_CSPELL_GLOB_ROOT];
    const cwd = envGlobRoot || process.cwd();
    return cwd;
}

function resolveGlobRoot(settings: CSpellSettingsWST, pathToSettingsFile: string): string {
    const settingsFileDirRaw = path.dirname(pathToSettingsFile);
    const isVSCode = path.basename(settingsFileDirRaw) === '.vscode';
    const settingsFileDir = isVSCode ? path.dirname(settingsFileDirRaw) : settingsFileDirRaw;
    const envGlobRoot = process.env[ENV_CSPELL_GLOB_ROOT];
    const defaultGlobRoot = envGlobRoot ?? '${cwd}';
    const rawRoot =
        settings.globRoot ??
        (settings.version === configSettingsFileVersion0_1 ||
        (envGlobRoot && !settings.version) ||
        (isVSCode && !settings.version)
            ? defaultGlobRoot
            : settingsFileDir);

    const globRoot = rawRoot.startsWith('${cwd}') ? rawRoot : path.resolve(settingsFileDir, rawRoot);
    return globRoot;
}

function resolveFilePath(filename: string, pathToSettingsFile: string): string {
    const cwd = process.cwd();

    return path.resolve(pathToSettingsFile, filename.replace('${cwd}', cwd));
}

function toGlobDef(g: undefined, root: string | undefined, source: string | undefined): undefined;
function toGlobDef(g: Glob, root: string | undefined, source: string | undefined): GlobDef;
function toGlobDef(g: Glob[], root: string | undefined, source: string | undefined): GlobDef[];
function toGlobDef(g: Glob | Glob[], root: string | undefined, source: string | undefined): GlobDef | GlobDef[];
function toGlobDef(
    g: Glob | Glob[] | undefined,
    root: string | undefined,
    source: string | undefined
): GlobDef | GlobDef[] | undefined {
    if (g === undefined) return undefined;
    if (Array.isArray(g)) {
        return g.map((g) => toGlobDef(g, root, source));
    }
    if (typeof g === 'string') {
        return toGlobDef(
            {
                glob: g,
                root,
            },
            root,
            source
        );
    }
    if (source) {
        return { ...g, source };
    }
    return g;
}

type NormalizeDictionaryDefsParams = Pick<CSpellUserSettings, 'dictionaryDefinitions' | 'languageSettings'>;

function normalizeDictionaryDefs(settings: NormalizeDictionaryDefsParams, pathToSettingsFile: string) {
    const dictionaryDefinitions = normalizePathForDictDefs(settings.dictionaryDefinitions, pathToSettingsFile);
    const languageSettings = settings.languageSettings?.map((langSetting) =>
        util.clean({
            ...langSetting,
            dictionaryDefinitions: normalizePathForDictDefs(langSetting.dictionaryDefinitions, pathToSettingsFile),
        })
    );

    return util.clean({
        dictionaryDefinitions,
        languageSettings,
    });
}

type NormalizeOverrides = Pick<CSpellUserSettings, 'globRoot' | 'overrides'>;
type NormalizeOverridesResult = Pick<CSpellUserSettings, 'overrides'>;

function normalizeOverrides(settings: NormalizeOverrides, pathToSettingsFile: string): NormalizeOverridesResult {
    const { globRoot = path.dirname(pathToSettingsFile) } = settings;
    const overrides = settings.overrides?.map((override) => {
        const filename = toGlobDef(override.filename, globRoot, pathToSettingsFile);
        const { dictionaryDefinitions, languageSettings } = normalizeDictionaryDefs(override, pathToSettingsFile);
        return util.clean({
            ...override,
            filename,
            dictionaryDefinitions,
            languageSettings: normalizeLanguageSettings(languageSettings),
        });
    });

    return overrides ? { overrides } : {};
}

type NormalizeReporters = Pick<CSpellUserSettings, 'reporters'>;

function normalizeReporters(settings: NormalizeReporters, pathToSettingsFile: string): NormalizeReporters {
    if (settings.reporters === undefined) return {};
    const folder = path.dirname(pathToSettingsFile);

    function resolve(s: string): string {
        const r = resolveFile(s, folder);
        if (!r.found) {
            throw new Error(`Not found: "${s}"`);
        }
        return r.filename;
    }

    function resolveReporter(s: ReporterSettings): ReporterSettings {
        if (typeof s === 'string') {
            return resolve(s);
        }
        if (!Array.isArray(s) || typeof s[0] !== 'string') throw new Error('Invalid Reporter');
        // Preserve the shape of Reporter Setting while resolving the reporter file.
        const [r, ...rest] = s;
        return [resolve(r), ...rest];
    }

    return {
        reporters: settings.reporters.map(resolveReporter),
    };
}

function normalizeLanguageSettings(languageSettings: LanguageSetting[] | undefined): LanguageSetting[] | undefined {
    if (!languageSettings) return undefined;

    function fixLocale(s: LanguageSetting): LanguageSetting {
        const { local: locale, ...rest } = s;
        return { locale, ...rest };
    }

    return languageSettings.map(fixLocale);
}

type NormalizeGitignoreRoot = Pick<CSpellUserSettings, 'gitignoreRoot'>;

function normalizeGitignoreRoot(settings: NormalizeGitignoreRoot, pathToSettingsFile: string): NormalizeGitignoreRoot {
    const { gitignoreRoot } = settings;
    if (!gitignoreRoot) return {};

    const dir = path.dirname(pathToSettingsFile);
    const roots = Array.isArray(gitignoreRoot) ? gitignoreRoot : [gitignoreRoot];

    return {
        gitignoreRoot: roots.map((p) => path.resolve(dir, p)),
    };
}

interface NormalizeSettingsGlobs {
    globRoot?: CSpellUserSettings['globRoot'];
    ignorePaths?: CSpellUserSettings['ignorePaths'];
}

interface NormalizeSettingsGlobsResult {
    ignorePaths?: GlobDef[];
}

function normalizeSettingsGlobs(
    settings: NormalizeSettingsGlobs,
    pathToSettingsFile: string
): NormalizeSettingsGlobsResult {
    const { globRoot } = settings;
    if (settings.ignorePaths === undefined) return {};

    const ignorePaths = toGlobDef(settings.ignorePaths, globRoot, pathToSettingsFile);
    return {
        ignorePaths,
    };
}

function normalizeCacheSettings(
    settings: Pick<CSpellUserSettings, 'cache'>,
    pathToSettingsDir: string
): Pick<CSpellUserSettings, 'cache'> {
    const { cache } = settings;
    if (cache === undefined) return {};
    const { cacheLocation } = cache;
    if (cacheLocation === undefined) return { cache };
    return { cache: { ...cache, cacheLocation: resolveFilePath(cacheLocation, pathToSettingsDir) } };
}

function validationMessage(msg: string, fileRef: ImportFileRef) {
    return msg + `\n  File: "${fileRef.filename}"`;
}

function validateRawConfigVersion(config: CSpellUserSettings | { version: unknown }, fileRef: ImportFileRef): void {
    const { version } = config;

    if (version === undefined) return;

    if (typeof version !== 'string') {
        logError(validationMessage(`Unsupported config file version: "${version}", string expected`, fileRef));
        return;
    }

    if (setOfSupportedConfigVersions.has(version)) return;

    if (!/^\d+(\.\d+)*$/.test(version)) {
        logError(validationMessage(`Unsupported config file version: "${version}"`, fileRef));
        return;
    }

    const msg =
        version > currentSettingsFileVersion
            ? `Newer config file version found: "${version}". Supported version is "${currentSettingsFileVersion}"`
            : `Legacy config file version found: "${version}", upgrade to "${currentSettingsFileVersion}"`;

    logWarning(validationMessage(msg, fileRef));
}

function validateRawConfigExports(config: CSpellUserSettings, fileRef: ImportFileRef): void {
    if ((<{ default: unknown }>config).default) {
        throw new ImportError(
            validationMessage('Module `export default` is not supported.\n  Use `module.exports =` instead.', fileRef)
        );
    }
}

interface NormalizableFields {
    version?: string | number;
}

function normalizeRawConfig(config: CSpellUserSettings | NormalizableFields) {
    if (typeof config.version === 'number') {
        config.version = config.version.toString();
    }
}

function validateRawConfig(config: CSpellUserSettings, fileRef: ImportFileRef): void {
    const validations = [validateRawConfigExports, validateRawConfigVersion];
    validations.forEach((fn) => fn(config, fileRef));
}

export const __testing__ = {
    mergeObjects,
    normalizeCacheSettings,
    normalizeSettings,
    validateRawConfigExports,
    validateRawConfigVersion,
};
