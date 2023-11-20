import type { CSpellUserSettings, ImportFileRef, Source } from '@cspell/cspell-types';
import { StrongWeakMap } from '@cspell/strong-weak-map';
import * as json from 'comment-json';
import type { Options as CosmicOptions, OptionsSync as CosmicOptionsSync } from 'cosmiconfig';
import { cosmiconfig, cosmiconfigSync } from 'cosmiconfig';
import type { CSpellConfigFile, CSpellConfigFileReaderWriter, IO, TextFile } from 'cspell-config-lib';
import { createReaderWriter } from 'cspell-config-lib';
import type { CSpellIO } from 'cspell-io';
import { getDefaultCSpellIO } from 'cspell-io';
import * as path from 'path';

import { createCSpellSettingsInternal as csi } from '../../../Models/CSpellSettingsInternalDef.js';
import { AutoResolveLRUCache } from '../../../util/AutoResolveLRUCache.js';
import { logError, logWarning } from '../../../util/logger.js';
import { resolveFile } from '../../../util/resolveFile.js';
import type { Uri } from '../../../util/Uri.js';
import { toUri } from '../../../util/Uri.js';
import {
    configSettingsFileVersion0_1,
    configSettingsFileVersion0_2,
    currentSettingsFileVersion,
    ENV_CSPELL_GLOB_ROOT,
} from '../../constants.js';
import { mergeSettings } from '../../CSpellSettingsServer.js';
import { getRawGlobalSettings } from '../../GlobalSettings.js';
import { ImportError } from '../ImportError.js';
import type { LoaderResult } from '../pnpLoader.js';
import { pnpLoader } from '../pnpLoader.js';
import { defaultSettings } from './defaultSettings.js';
import {
    normalizeCacheSettings,
    normalizeDictionaryDefs,
    normalizeGitignoreRoot,
    normalizeLanguageSettings,
    normalizeOverrides,
    normalizeRawConfig,
    normalizeReporters,
    normalizeSettingsGlobs,
} from './normalizeRawSettings.js';
import type { PnPSettingsOptional } from './PnPSettings.js';
import { defaultPnPSettings, normalizePnPSettings } from './PnPSettings.js';
import type { CSpellSettingsI, CSpellSettingsWST } from './types.js';

type CSpellSettingsVersion = Exclude<CSpellUserSettings['version'], undefined>;
const supportedCSpellConfigVersions: CSpellSettingsVersion[] = [configSettingsFileVersion0_2];

const setOfSupportedConfigVersions = Object.freeze(new Set<string>(supportedCSpellConfigVersions));

export const sectionCSpell = 'cSpell';

export const defaultFileName = 'cspell.json';

const gcl = getDefaultConfigLoaderInternal;

const CACHE_SIZE_SEARCH_CONFIG = 32;

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
    '.cspell.config.json',
    '.cspell.config.jsonc',
    '.cspell.config.yaml',
    '.cspell.config.yml',
    'cspell.config.json',
    'cspell.config.jsonc',
    'cspell.config.yaml',
    'cspell.config.yml',
    '.cspell.yaml',
    '.cspell.yml',
    'cspell.yaml',
    'cspell.yml',
    // Dynamic config is looked for last
    'cspell.config.js',
    'cspell.config.cjs',
    // .config
    '.config/.cspell.json',
    '.config/cspell.json',
    '.config/.cSpell.json',
    '.config/cSpell.json',
    '.config/.cspell.jsonc',
    '.config/cspell.jsonc',
    '.config/cspell.config.json',
    '.config/cspell.config.jsonc',
    '.config/cspell.config.yaml',
    '.config/cspell.config.yml',
    '.config/cspell.yaml',
    '.config/cspell.yml',
    '.config/cspell.config.js',
    '.config/cspell.config.cjs',
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

let defaultConfigLoader: ConfigLoaderInternal | undefined = undefined;

export class ConfigLoader {
    /**
     * Use `createConfigLoader`
     * @param cspellIO - CSpellIO interface for reading files.
     */
    protected constructor(readonly cspellIO: CSpellIO) {
        this.cspellConfigFileReaderWriter = createReaderWriter(undefined, undefined, createIO(cspellIO));
    }

    protected cachedCookedConfigFileSettings = new Map<string, CSpellSettingsI>();
    protected cachedConfigFiles = new Map<string, CSpellConfigFile>();
    protected cachedPendingConfigFile = new StrongWeakMap<string, Promise<CSpellConfigFile>>();
    protected cspellConfigExplorer = cosmiconfig('cspell', cspellCosmiconfig);
    protected cspellConfigExplorerSync = cosmiconfigSync('cspell', cspellCosmiconfig);
    protected globalSettings: CSpellSettingsI | undefined;
    protected cspellConfigFileReaderWriter: CSpellConfigFileReaderWriter;

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
        defaultValue?: CSpellSettingsWST,
    ): CSpellSettingsI {
        // console.log('Read Settings: %o', { filename, relativeToOrDefault });
        const relativeTo = (typeof relativeToOrDefault === 'string' ? relativeToOrDefault : '') || process.cwd();
        defaultValue = defaultValue || (typeof relativeToOrDefault !== 'string' ? relativeToOrDefault : undefined);
        const ref = resolveFilename(filename, relativeTo);
        return this.importSettings(ref, defaultValue, defaultValue || defaultPnPSettings);
    }

    public async readSettingsAsync(
        filename: string | URL,
        relativeTo?: string | URL,
        pnpSettings?: PnPSettingsOptional,
    ): Promise<CSpellSettingsI> {
        const ref = resolveFilename(filename, relativeTo || process.cwd());
        return this.importSettings(ref, undefined, pnpSettings || defaultPnPSettings);
    }

    public async readConfigFile(
        filenameOrURL: string | URL,
        relativeTo?: string | URL,
    ): Promise<CSpellConfigFile | Error> {
        const ref = resolveFilename(filenameOrURL.toString(), relativeTo || process.cwd());
        const url = toURL(ref.filename);
        const href = url.href;
        try {
            if (ref.error) throw ref.error;
            const cached = this.cachedConfigFiles.get(href);
            if (cached) return cached;
            const pending = this.cachedPendingConfigFile.get(href);
            if (pending) return pending;
            const p = this.cspellConfigFileReaderWriter.readConfig(href);
            this.cachedPendingConfigFile.set(href, p);
            const file = await p;
            this.cachedConfigFiles.set(href, file);
            return file;
        } catch (error) {
            return new ImportError(`Failed to read config file: "${ref.filename}"`, error);
        } finally {
            this.cachedPendingConfigFile.delete(href);
        }
    }

    /**
     *
     * @param searchFrom the directory / file to start searching from.
     * @param pnpSettings - related to Using Yarn PNP.
     * @returns the resulting settings
     */
    searchForConfig(
        searchFrom: string | undefined,
        pnpSettings: PnPSettingsOptional = defaultPnPSettings,
    ): Promise<CSpellSettingsI | undefined> {
        pnpSettings = normalizePnPSettings(pnpSettings);
        return this.searchConfigLRU.get({ searchFrom, pnpSettings }, (p) => this._searchForConfig(p));
    }

    private searchConfigLRU = new AutoResolveLRUCache<
        {
            searchFrom: string | undefined;
            pnpSettings: PnPSettingsOptional;
        },
        Promise<CSpellSettingsI | undefined>
    >(CACHE_SIZE_SEARCH_CONFIG, (a, b) => a.searchFrom === b.searchFrom && a.pnpSettings === b.pnpSettings);

    private _searchForConfig(params: {
        searchFrom: string | undefined;
        pnpSettings: PnPSettingsOptional;
    }): Promise<CSpellSettingsI | undefined> {
        // console.log('_searchForConfig: %o', { params, stats: this.searchConfigLRU.stats() });
        return gcl()
            .normalizeSearchForConfigResultAsync(
                params.searchFrom || process.cwd(),
                this.cspellConfigExplorer.search(params.searchFrom),
                params.pnpSettings,
            )
            .then((r) => (r.filepath ? r.config : undefined));
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
        this.searchConfigLRU.clear();
        this.globalSettings = undefined;
        this.cachedCookedConfigFileSettings.clear();
        this.cachedConfigFiles.clear();
        this.cspellConfigExplorer.clearCaches();
        this.cspellConfigExplorerSync.clearCaches();
        this.cspellConfigFileReaderWriter.clearCachedFiles();
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
        pnpSettings: PnPSettingsOptional,
    ): CSpellSettingsI {
        defaultValues = defaultValues ?? defaultSettings;
        const { filename } = fileRef;
        const importRef: ImportFileRef = { ...fileRef };
        const cached = this.cachedCookedConfigFileSettings.get(filename);
        if (cached) {
            const cachedImportRef = cached.__importRef || importRef;
            cachedImportRef.referencedBy = mergeSourceList(cachedImportRef.referencedBy || [], importRef.referencedBy);
            cached.__importRef = cachedImportRef;
            return cached;
        }
        const id = [path.basename(path.dirname(filename)), path.basename(filename)].join('/');
        const name = '';
        const finalizeSettings: CSpellSettingsI = csi({ id, name, __importRef: importRef });
        this.cachedCookedConfigFileSettings.set(filename, finalizeSettings); // add an empty entry to prevent circular references.
        const settings: CSpellSettingsWST = { ...defaultValues, id, name, ...this.readConfig(importRef) };

        Object.assign(finalizeSettings, this.normalizeSettings(settings, filename, pnpSettings));
        const finalizeSrc: Source = { name: path.basename(filename), ...finalizeSettings.source };
        finalizeSettings.source = { ...finalizeSrc, filename };
        this.cachedCookedConfigFileSettings.set(filename, finalizeSettings);
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
        pnpSettings: PnPSettingsOptional,
    ): CSpellSettingsI {
        const id =
            rawSettings.id ||
            [path.basename(path.dirname(pathToSettingsFile)), path.basename(pathToSettingsFile)].join('/');
        const name = rawSettings.name || id;

        // Try to load any .pnp files before reading dictionaries or other config files.
        const { usePnP = pnpSettings.usePnP, pnpFiles = pnpSettings.pnpFiles } = rawSettings;
        const pnpSettingsToUse: PnPSettingsOptional = normalizePnPSettings({ usePnP, pnpFiles });
        const pathToSettingsDir = path.dirname(pathToSettingsFile);
        loadPnPSync(pnpSettingsToUse, toUri(pathToSettingsDir));

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
        return this.cachedCookedConfigFileSettings;
    }

    get _cspellConfigExplorer() {
        return this.cspellConfigExplorer;
    }

    get _cspellConfigExplorerSync() {
        return this.cspellConfigExplorerSync;
    }

    readonly _readConfig = this.readConfig.bind(this);
    readonly _normalizeSettings = this.normalizeSettings.bind(this);

    async normalizeSearchForConfigResultAsync(
        searchPath: string,
        searchResult: Promise<SearchForConfigResult | null>,
        pnpSettings: PnPSettingsOptional,
    ): Promise<NormalizeSearchForConfigResult> {
        let result: SearchForConfigResult | ImportError | undefined;
        try {
            result = (await searchResult) || undefined;
        } catch (cause) {
            result = new ImportError(`Failed to find config file at: "${searchPath}"`, cause);
        }

        return this.normalizeSearchForConfigResult(searchPath, result, pnpSettings);
    }

    normalizeSearchForConfigResult(
        searchPath: string,
        searchResult: SearchForConfigResult | ImportError | undefined,
        pnpSettings: PnPSettingsOptional,
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
        Object.assign(finalizeSettings, this.normalizeSettings(settings, filename, pnpSettings));

        return {
            config: finalizeSettings,
            filepath,
            error,
        };
    }
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

/**
 *
 * @param searchFrom the directory / file to start searching from.
 * @param pnpSettings - related to Using Yarn PNP.
 * @returns the resulting settings
 */
export function searchForConfig(
    searchFrom: string | undefined,
    pnpSettings: PnPSettingsOptional = defaultPnPSettings,
): Promise<CSpellSettingsI | undefined> {
    return gcl().searchForConfig(searchFrom, pnpSettings);
}

/**
 *
 * @param searchFrom the directory / file to start searching from.
 * @param pnpSettings - related to Using Yarn PNP.
 * @returns the resulting settings
 * @deprecated
 * @deprecationMessage Use `searchForConfig`. It is very difficult to support Sync files when settings include web requests.
 */
export function searchForConfigSync(
    searchFrom: string | undefined,
    pnpSettings: PnPSettingsOptional = defaultPnPSettings,
): CSpellSettingsI | undefined {
    pnpSettings = normalizePnPSettings(pnpSettings);
    let searchResult: SearchForConfigResult | ImportError | undefined;
    try {
        searchResult = cspellConfigExplorerSync().search(searchFrom) || undefined;
    } catch (err) {
        searchResult = new ImportError(`Failed to find config file from: "${searchFrom}"`, err);
    }
    return gcl().normalizeSearchForConfigResult(searchFrom || process.cwd(), searchResult, pnpSettings).config;
}

/**
 * Load a CSpell configuration files.
 * @param file - path or package reference to load.
 * @param pnpSettings - PnP settings
 * @returns normalized CSpellSettings
 */
export async function loadConfig(
    file: string,
    pnpSettings: PnPSettingsOptional = defaultPnPSettings,
): Promise<CSpellSettingsI> {
    return gcl().readSettingsAsync(file, undefined, pnpSettings);
}

/**
 * Load a CSpell configuration files.
 * @param filename - path or package reference to load.
 * @param pnpSettings - PnP settings
 * @returns normalized CSpellSettings
 * @deprecated
 */
export function loadConfigSync(
    filename: string,
    pnpSettings: PnPSettingsOptional = defaultPnPSettings,
): CSpellSettingsI {
    const pnp = normalizePnPSettings(pnpSettings);
    return gcl().readSettings(filename, pnp);
}

export function loadPnP(pnpSettings: PnPSettingsOptional, searchFrom: Uri): Promise<LoaderResult> {
    if (!pnpSettings.usePnP) {
        return Promise.resolve(undefined);
    }
    const loader = pnpLoader(pnpSettings.pnpFiles);
    return loader.load(searchFrom);
}

export function loadPnPSync(pnpSettings: PnPSettingsOptional, searchFrom: Uri): LoaderResult {
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

function toURL(filename: string | URL | Uri): URL {
    if (filename instanceof URL) return filename;
    return new URL(toUri(filename).toString());
}

function resolveFilename(filename: string | URL, relativeTo: string | URL): ImportFileRef {
    if (filename instanceof URL) return { filename: filename.href };
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

const nestedConfigDirectories: Record<string, true> = {
    '.vscode': true,
    '.config': true,
};

function resolveGlobRoot(settings: CSpellSettingsWST, pathToSettingsFile: string): string {
    const settingsFileDirRaw = path.dirname(pathToSettingsFile);
    const settingsFileDirName = path.basename(settingsFileDirRaw);
    const isNestedConfig = settingsFileDirName in nestedConfigDirectories;
    const isVSCode = settingsFileDirName === '.vscode';
    const settingsFileDir = isNestedConfig ? path.dirname(settingsFileDirRaw) : settingsFileDirRaw;
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
            validationMessage('Module `export default` is not supported.\n  Use `module.exports =` instead.', fileRef),
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

function cachedFiles() {
    return gcl()._cachedFiles;
}

function cspellConfigExplorerSync() {
    return gcl()._cspellConfigExplorerSync;
}

function createIO(cspellIO: CSpellIO): IO {
    const readFile = (url: URL) => cspellIO.readFile(url).then((file) => ({ url: file.url, content: file.getText() }));
    const writeFile = (file: TextFile) => cspellIO.writeFile(file.url, file.content);
    return {
        readFile,
        writeFile,
    };
}

export const __testing__ = {
    getDefaultConfigLoaderInternal,
    normalizeCacheSettings,
    validateRawConfigExports,
    validateRawConfigVersion,
    toURL,
};
