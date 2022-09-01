import type {
    CSpellSettingsWithSourceTrace,
    CSpellUserSettings,
    ImportFileRef,
    PnPSettings as PnPSettingsStrict,
    Source,
} from '@cspell/cspell-types';
import * as json from 'comment-json';
import { cosmiconfig, cosmiconfigSync, Options as CosmicOptions, OptionsSync as CosmicOptionsSync } from 'cosmiconfig';
import { CSpellIO, getDefaultCSpellIO } from 'cspell-io';
import * as path from 'path';
import { URI } from 'vscode-uri';
import { createCSpellSettingsInternal as csi, CSpellSettingsInternal } from '../../../Models/CSpellSettingsInternalDef';
import { logError, logWarning } from '../../../util/logger';
import { resolveFile } from '../../../util/resolveFile';
import { OptionalOrUndefined } from '../../../util/types';
import {
    configSettingsFileVersion0_1,
    configSettingsFileVersion0_2,
    currentSettingsFileVersion,
    ENV_CSPELL_GLOB_ROOT,
} from '../../constants';
import { mergeSettings } from '../../CSpellSettingsServer';
import { getRawGlobalSettings } from '../../GlobalSettings';
import { ImportError } from '../ImportError';
import { LoaderResult, pnpLoader } from '../pnpLoader';
import {
    normalizeCacheSettings,
    normalizeDictionaryDefs,
    normalizeGitignoreRoot,
    normalizeLanguageSettings,
    normalizeOverrides,
    normalizeRawConfig,
    normalizeReporters,
    normalizeSettingsGlobs,
} from './normalizeRawSettings';
import { readSettings } from './readSettings';

export type CSpellSettingsWST = CSpellSettingsWithSourceTrace;
export type CSpellSettingsI = CSpellSettingsInternal;
type CSpellSettingsVersion = Exclude<CSpellUserSettings['version'], undefined>;
type PnPSettings = OptionalOrUndefined<PnPSettingsStrict>;

const supportedCSpellConfigVersions: CSpellSettingsVersion[] = [configSettingsFileVersion0_2];

const setOfSupportedConfigVersions = Object.freeze(new Set<string>(supportedCSpellConfigVersions));

export const sectionCSpell = 'cSpell';

export const defaultFileName = 'cspell.json';

/**
 * Logic of the locations:
 * - Support backward compatibility with the VS Code Spell Checker
 *   the spell checker extension can only write to `.json` files because
 *   it would be too difficult to automatically modify a `.js` or `.cjs` file.
 * - To support `cspell.config.js` in a VS Code environment, have a `cspell.json` import
 *   the `cspell.config.js`.
 */
const searchPlaces = Object.freeze([
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
]);

const cspellCosmiconfig: CosmicOptions & CosmicOptionsSync = {
    searchPlaces: searchPlaces.concat(),
    loaders: {
        '.json': parseJson,
        '.jsonc': parseJson,
    },
};

function parseJson(_filename: string, content: string) {
    return json.parse(content) as unknown;
}

export const defaultConfigFilenames = Object.freeze(searchPlaces.concat());

const defaultSettings: CSpellSettingsI = csi({
    id: 'default',
    name: 'default',
    version: currentSettingsFileVersion,
});

const defaultPnPSettings: PnPSettings = {};

let defaultConfigLoader: ConfigLoaderInternal | undefined = undefined;

export class ConfigLoader {
    /**
     * Use `createConfigLoader`
     * @param cspellIO - CSpellIO interface for reading files.
     */
    protected constructor(readonly cspellIO: CSpellIO) {}

    protected cachedFiles = new Map<string, CSpellSettingsI>();
    protected cspellConfigExplorer = cosmiconfig('cspell', cspellCosmiconfig);
    protected cspellConfigExplorerSync = cosmiconfigSync('cspell', cspellCosmiconfig);
    protected globalSettings: CSpellSettingsI | undefined;

    /**
     * Read / import a cspell configuration file.
     * @param filename - the path to the file.
     *   Supported types: json, yaml, js, and cjs. ES Modules are not supported.
     *   - absolute path `/absolute/path/to/file`
     *   - relative path `./path/to/file` (relative to the current working directory)
     *   - package `@cspell/dict-typescript/cspell-ext.json`
     */
    public readSettings(filename: string): CSpellSettingsI;
    public readSettings(filename: string, defaultValues: CSpellSettingsWST): CSpellSettingsI;
    /**
     * Read / import a cspell configuration file.
     * @param filename - the path to the file.
     *   Supported types: json, yaml, js, and cjs. ES Modules are not supported.
     *   - absolute path `/absolute/path/to/file`
     *   - relative path `./path/to/file` (relative to `relativeTo`)
     *   - package `@cspell/dict-typescript/cspell-ext.json` searches for node_modules relative to `relativeTo`
     * @param relativeTo - absolute path to start searching for relative files or node_modules.
     */
    public readSettings(filename: string, relativeTo?: string): CSpellSettingsI;
    public readSettings(filename: string, relativeTo: string, defaultValues: CSpellSettingsWST): CSpellSettingsI;
    public readSettings(filename: string, relativeToOrDefault?: CSpellSettingsWST | string): CSpellSettingsI;
    public readSettings(
        filename: string,
        relativeToOrDefault?: CSpellSettingsWST | string,
        defaultValue?: CSpellSettingsWST
    ): CSpellSettingsI {
        const relativeTo = typeof relativeToOrDefault === 'string' ? relativeToOrDefault : process.cwd();
        defaultValue = defaultValue || (typeof relativeToOrDefault !== 'string' ? relativeToOrDefault : undefined);
        const ref = resolveFilename(filename, relativeTo);
        return this.importSettings(ref, defaultValue, defaultValue || defaultPnPSettings);
    }

    public getGlobalSettings(): CSpellSettingsI {
        if (!this.globalSettings) {
            const globalConf = getRawGlobalSettings();

            this.globalSettings = {
                id: 'global_config',
                ...this.normalizeSettings(globalConf || {}, './global_config', {}),
            };
        }
        return this.globalSettings;
    }

    public clearCachedSettingsFiles(): void {
        this.globalSettings = undefined;
        this.cachedFiles.clear();
        this.cspellConfigExplorer.clearCaches();
        this.cspellConfigExplorerSync.clearCaches();
    }

    /**
     * Read a config file and inject the fileRef.
     * @param fileRef - filename plus context, injected into the resulting config.
     */
    protected readConfig(fileRef: ImportFileRef): CSpellSettingsWST {
        // cspellConfigExplorerSync
        const { filename, error } = fileRef;
        if (error) {
            fileRef.error =
                error instanceof ImportError
                    ? error
                    : new ImportError(`Failed to read config file: "${filename}"`, error);
            return { __importRef: fileRef };
        }
        const s: CSpellSettingsWST = {};
        try {
            const r = this.cspellConfigExplorerSync.load(filename);
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

    protected importSettings(
        fileRef: ImportFileRef,
        defaultValues: CSpellSettingsWST | undefined,
        pnpSettings: PnPSettings
    ): CSpellSettingsI {
        defaultValues = defaultValues ?? defaultSettings;
        const { filename } = fileRef;
        const importRef: ImportFileRef = { ...fileRef };
        const cached = this.cachedFiles.get(filename);
        if (cached) {
            const cachedImportRef = cached.__importRef || importRef;
            cachedImportRef.referencedBy = mergeSourceList(cachedImportRef.referencedBy || [], importRef.referencedBy);
            cached.__importRef = cachedImportRef;
            return cached;
        }
        const id = [path.basename(path.dirname(filename)), path.basename(filename)].join('/');
        const name = id;
        const finalizeSettings: CSpellSettingsI = csi({ id, name, __importRef: importRef });
        this.cachedFiles.set(filename, finalizeSettings); // add an empty entry to prevent circular references.
        const settings: CSpellSettingsWST = { ...defaultValues, id, name, ...this.readConfig(importRef) };

        Object.assign(finalizeSettings, this.normalizeSettings(settings, filename, pnpSettings));
        const finalizeSrc: Source = { name: path.basename(filename), ...finalizeSettings.source };
        finalizeSettings.source = { ...finalizeSrc, filename };
        this.cachedFiles.set(filename, finalizeSettings);
        return finalizeSettings;
    }

    /**
     * normalizeSettings handles correcting all relative paths, anchoring globs, and importing other config files.
     * @param rawSettings - raw configuration settings
     * @param pathToSettingsFile - path to the source file of the configuration settings.
     */
    protected normalizeSettings(
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
            .map((ref) => this.importSettings(ref, undefined, pnpSettingsToUse))
            .reduce((a, b) => mergeSettings(a, b));
        const finalizeSettings = mergeSettings(importedSettings, fileSettings);
        finalizeSettings.name = settings.name || finalizeSettings.name || '';
        finalizeSettings.id = settings.id || finalizeSettings.id || '';
        return finalizeSettings;
    }
}

class ConfigLoaderInternal extends ConfigLoader {
    constructor(cspellIO: CSpellIO) {
        super(cspellIO);
    }

    get _cachedFiles() {
        return this.cachedFiles;
    }

    get _cspellConfigExplorer() {
        return this.cspellConfigExplorer;
    }

    get _cspellConfigExplorerSync() {
        return this.cspellConfigExplorerSync;
    }

    readonly _readConfig = this.readConfig.bind(this);
    readonly _normalizeSettings = this.normalizeSettings.bind(this);
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

async function normalizeSearchForConfigResultAsync(
    searchPath: string,
    searchResult: Promise<SearchForConfigResult | null>,
    pnpSettings: PnPSettings
): Promise<NormalizeSearchForConfigResult> {
    let result: SearchForConfigResult | ImportError | undefined;
    try {
        result = (await searchResult) || undefined;
    } catch (cause) {
        result = new ImportError(`Failed to find config file at: "${searchPath}"`, cause);
    }

    return normalizeSearchForConfigResult(searchPath, result, pnpSettings);
}

function normalizeSearchForConfigResult(
    searchPath: string,
    searchResult: SearchForConfigResult | ImportError | undefined,
    pnpSettings: PnPSettings
): NormalizeSearchForConfigResult {
    const error = searchResult instanceof ImportError ? searchResult : undefined;
    const result = searchResult instanceof ImportError ? undefined : searchResult;

    const filepath = result?.filepath;
    if (filepath) {
        const cached = cachedFiles().get(filepath);
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
    cachedFiles().set(filename, finalizeSettings); // add an empty entry to prevent circular references.
    Object.assign(finalizeSettings, gcl()._normalizeSettings(settings, filename, pnpSettings));

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
    return normalizeSearchForConfigResultAsync(
        searchFrom || process.cwd(),
        cspellConfigExplorer().search(searchFrom),
        pnpSettings
    ).then((r) => (r.filepath ? r.config : undefined));
}

export function searchForConfigSync(
    searchFrom: string | undefined,
    pnpSettings: PnPSettings = defaultPnPSettings
): CSpellSettingsI | undefined {
    let searchResult: SearchForConfigResult | ImportError | undefined;
    try {
        searchResult = cspellConfigExplorerSync().search(searchFrom) || undefined;
    } catch (err) {
        searchResult = new ImportError(`Failed to find config file from: "${searchFrom}"`, err);
    }
    return normalizeSearchForConfigResult(searchFrom || process.cwd(), searchResult, pnpSettings).config;
}

/**
 * Load a CSpell configuration files.
 * @param file - path or package reference to load.
 * @param pnpSettings - PnP settings
 * @returns normalized CSpellSettings
 */
export function loadConfig(file: string, pnpSettings: PnPSettings = defaultPnPSettings): Promise<CSpellSettingsI> {
    const cached = cachedFiles().get(path.resolve(file));
    if (cached) {
        return Promise.resolve(cached);
    }
    return normalizeSearchForConfigResultAsync(file, cspellConfigExplorer().load(file), pnpSettings).then(
        (r) => r.config
    );
}

/**
 * Load a CSpell configuration files.
 * @param filename - path or package reference to load.
 * @param pnpSettings - PnP settings
 * @returns normalized CSpellSettings
 */
export function loadConfigSync(filename: string, pnpSettings: PnPSettings = defaultPnPSettings): CSpellSettingsI {
    const cached = cachedFiles().get(path.resolve(filename));
    if (cached) {
        return cached;
    }
    let searchResult: SearchForConfigResult | ImportError | undefined;
    try {
        searchResult = cspellConfigExplorerSync().load(filename) || undefined;
    } catch (err) {
        searchResult = new ImportError(`Failed to find config file at: "${filename}"`, err);
    }
    return normalizeSearchForConfigResult(filename, searchResult, pnpSettings).config;
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
    return gcl()._readConfig(ref);
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

function resolveFilename(filename: string, relativeTo: string): ImportFileRef {
    const r = resolveFile(filename, relativeTo);

    return {
        filename: r.filename,
        error: r.found ? undefined : new Error(`Failed to resolve file: "${filename}"`),
    };
}

export function getGlobalSettings(): CSpellSettingsI {
    return gcl().getGlobalSettings();
}

export function getCachedFileSize(): number {
    return cachedFiles().size;
}

export function clearCachedSettingsFiles(): void {
    return gcl().clearCachedSettingsFiles();
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

function validateRawConfig(config: CSpellUserSettings, fileRef: ImportFileRef): void {
    const validations = [validateRawConfigExports, validateRawConfigVersion];
    validations.forEach((fn) => fn(config, fileRef));
}

function createConfigLoaderInternal(cspellIO?: CSpellIO) {
    return new ConfigLoaderInternal(cspellIO ?? getDefaultCSpellIO());
}

export function createConfigLoader(cspellIO?: CSpellIO): ConfigLoader {
    return createConfigLoaderInternal(cspellIO);
}

function getDefaultConfigLoaderInternal(): ConfigLoaderInternal {
    if (defaultConfigLoader) return defaultConfigLoader;

    return (defaultConfigLoader = createConfigLoaderInternal());
}

export function getDefaultConfigLoader(): ConfigLoader {
    return getDefaultConfigLoaderInternal();
}

const gcl = getDefaultConfigLoaderInternal;

function cachedFiles() {
    return gcl()._cachedFiles;
}

function cspellConfigExplorer() {
    return gcl()._cspellConfigExplorer;
}

function cspellConfigExplorerSync() {
    return gcl()._cspellConfigExplorerSync;
}

export const __testing__ = {
    getDefaultConfigLoaderInternal,
    normalizeCacheSettings,
    validateRawConfigExports,
    validateRawConfigVersion,
};
