import type { CSpellUserSettings, ImportFileRef, Source } from '@cspell/cspell-types';
import assert from 'assert';
import type { CSpellConfigFile, CSpellConfigFileReaderWriter, IO, TextFile } from 'cspell-config-lib';
import { createReaderWriter, CSpellConfigFileInMemory } from 'cspell-config-lib';
import { isUrlLike } from 'cspell-io';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { URI, Utils as UriUtils } from 'vscode-uri';

import { onClearCache } from '../../../events/index.js';
import type { FileSystem } from '../../../fileSystem.js';
import { createTextFileResource, getCSpellIO, getVirtualFS } from '../../../fileSystem.js';
import { createCSpellSettingsInternal as csi } from '../../../Models/CSpellSettingsInternalDef.js';
import { AutoResolveCache } from '../../../util/AutoResolve.js';
import { logError, logWarning } from '../../../util/logger.js';
import { resolveFile } from '../../../util/resolveFile.js';
import {
    addTrailingSlash,
    cwdURL,
    resolveFileWithURL,
    toFilePathOrHref,
    windowsDriveLetterToUpper,
} from '../../../util/url.js';
import {
    configSettingsFileVersion0_1,
    configSettingsFileVersion0_2,
    currentSettingsFileVersion,
    ENV_CSPELL_GLOB_ROOT,
} from '../../constants.js';
import { getMergeStats, mergeSettings } from '../../CSpellSettingsServer.js';
import { getGlobalConfig } from '../../GlobalSettings.js';
import { ImportError } from '../ImportError.js';
import type { LoaderResult } from '../pnpLoader.js';
import { pnpLoader } from '../pnpLoader.js';
import { searchPlaces } from './configLocations.js';
import { ConfigSearch } from './configSearch.js';
import { configToRawSettings } from './configToRawSettings.js';
import { defaultSettings } from './defaultSettings.js';
import {
    normalizeCacheSettings,
    normalizeDictionaryDefs,
    normalizeGitignoreRoot,
    normalizeImport,
    normalizeLanguageSettings,
    normalizeOverrides,
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

interface ImportedConfigEntry {
    /** href of the configFile URL, this is the key to the cache. */
    href: string;
    /** The fileRef used. */
    fileRef: ImportFileRef;
    /** resolved config file */
    configFile: CSpellConfigFile | undefined;
    /** resolved settings */
    settings: CSpellSettingsI | undefined;
    isReady: boolean;
    /** Resolved when the settings have been fully resolved. */
    onReady: Promise<CSpellSettingsI>;
    /** Resolved when the config file has been loaded. */
    onConfigFileReady: Promise<CSpellConfigFile | Error>;
    /** Set of all references used to catch circular references */
    referencedSet: Set<string>;
}

let defaultConfigLoader: ConfigLoaderInternal | undefined = undefined;

interface CacheMergeConfigFileWithImports {
    // cfgFile: CSpellConfigFile;
    pnpSettings: PnPSettingsOptional | undefined;
    referencedBy: string[] | undefined;
    result: Promise<CSpellSettingsI>;
}

export interface IConfigLoader {
    readSettingsAsync(
        filename: string | URL,
        relativeTo?: string | URL,
        pnpSettings?: PnPSettingsOptional,
    ): Promise<CSpellSettingsI>;

    /**
     * Read a cspell configuration file.
     * @param filenameOrURL - URL, relative path, absolute path, or package name.
     * @param relativeTo - optional URL, defaults to `pathToFileURL('./')`
     */
    readConfigFile(filenameOrURL: string | URL, relativeTo?: string | URL): Promise<CSpellConfigFile | Error>;

    searchForConfigFileLocation(searchFrom: URL | string | undefined): Promise<URL | undefined>;

    searchForConfigFile(searchFrom: URL | string | undefined): Promise<CSpellConfigFile | undefined>;

    /**
     * This is an alias for `searchForConfigFile` and `mergeConfigFileWithImports`.
     * @param searchFrom the directory / file URL to start searching from.
     * @param pnpSettings - related to Using Yarn PNP.
     * @returns the resulting settings
     */
    searchForConfig(
        searchFrom: URL | string | undefined,
        pnpSettings?: PnPSettingsOptional,
    ): Promise<CSpellSettingsI | undefined>;

    getGlobalSettingsAsync(): Promise<CSpellSettingsI>;

    /**
     * The loader caches configuration files for performance. This method clears the cache.
     */
    clearCachedSettingsFiles(): void;

    /**
     * Resolve imports and merge.
     * @param cfgFile - configuration file.
     * @param pnpSettings - optional settings related to Using Yarn PNP.
     */
    mergeConfigFileWithImports(
        cfgFile: CSpellConfigFile,
        pnpSettings?: PnPSettingsOptional | undefined,
    ): Promise<CSpellSettingsI>;

    /**
     * Create an in memory CSpellConfigFile.
     * @param filename - URL to the file. Used to resolve imports.
     * @param settings - settings to use.
     */
    createCSpellConfigFile(filename: URL | string, settings: CSpellUserSettings): CSpellConfigFile;

    /**
     * Unsubscribe from any events and dispose of any resources including caches.
     */
    dispose(): void;

    getStats(): Readonly<Record<string, Readonly<Record<string, number>>>>;
}

export class ConfigLoader implements IConfigLoader {
    public onReady: Promise<void>;
    private cspellIO = getCSpellIO();

    /**
     * Use `createConfigLoader`
     * @param virtualFs - virtual file system to use.
     */
    protected constructor(readonly fs: FileSystem) {
        this.cspellConfigFileReaderWriter = createReaderWriter(undefined, undefined, createIO(fs));
        this.onReady = this.prefetchGlobalSettingsAsync();
        this.subscribeToEvents();
    }

    private subscribeToEvents() {
        this.toDispose.push(onClearCache(() => this.clearCachedSettingsFiles()));
    }

    protected cachedConfig = new Map<string, ImportedConfigEntry>();
    protected cachedConfigFiles = new Map<string, CSpellConfigFile>();
    protected cachedPendingConfigFile = new AutoResolveCache<string, Promise<CSpellConfigFile | Error>>();
    protected cachedMergedConfig = new WeakMap<CSpellConfigFile, CacheMergeConfigFileWithImports>();
    protected globalSettings: CSpellSettingsI | undefined;
    protected cspellConfigFileReaderWriter: CSpellConfigFileReaderWriter;
    protected configSearch = new ConfigSearch(searchPlaces);

    protected toDispose: { dispose: () => void }[] = [];

    public async readSettingsAsync(
        filename: string | URL,
        relativeTo?: string | URL,
        pnpSettings?: PnPSettingsOptional,
    ): Promise<CSpellSettingsI> {
        await this.onReady;
        const ref = resolveFilename(filename, relativeTo || pathToFileURL('./'));
        const entry = this.importSettings(ref, pnpSettings || defaultPnPSettings, []);
        return entry.onReady;
    }

    public async readConfigFile(
        filenameOrURL: string | URL,
        relativeTo?: string | URL,
    ): Promise<CSpellConfigFile | Error> {
        const ref = resolveFilename(filenameOrURL.toString(), relativeTo || pathToFileURL('./'));
        const url = this.cspellIO.toFileURL(ref.filename);
        const href = url.href;
        if (ref.error) return new ImportError(`Failed to read config file: "${ref.filename}"`, ref.error);
        const cached = this.cachedConfigFiles.get(href);
        if (cached) return cached;
        return this.cachedPendingConfigFile.get(href, async () => {
            try {
                const file = await this.cspellConfigFileReaderWriter.readConfig(href);
                this.cachedConfigFiles.set(href, file);
                // validateRawConfigVersion(file);
                return file;
            } catch (error) {
                // console.warn('Debug: %o', { href, error });
                return new ImportError(`Failed to read config file: "${ref.filename}"`, error);
            } finally {
                setTimeout(() => this.cachedPendingConfigFile.delete(href), 1);
            }
        });
    }

    async searchForConfigFileLocation(searchFrom: URL | string | undefined): Promise<URL | undefined> {
        const url = this.cspellIO.toFileURL(searchFrom || cwdURL(), cwdURL());
        if (typeof searchFrom === 'string' && !isUrlLike(searchFrom) && url.protocol === 'file:') {
            // check to see if it is a directory
            if (await isDirectory(this.fs, url)) {
                return this.configSearch.searchForConfig(addTrailingSlash(url));
            }
        }
        return this.configSearch.searchForConfig(url);
    }

    async searchForConfigFile(searchFrom: URL | string | undefined): Promise<CSpellConfigFile | undefined> {
        const location = await this.searchForConfigFileLocation(searchFrom);
        if (!location) return undefined;
        const file = await this.readConfigFile(location);
        return file instanceof Error ? undefined : file;
    }

    /**
     *
     * @param searchFrom the directory / file URL to start searching from.
     * @param pnpSettings - related to Using Yarn PNP.
     * @returns the resulting settings
     */
    async searchForConfig(
        searchFrom: URL | string | undefined,
        pnpSettings: PnPSettingsOptional = defaultPnPSettings,
    ): Promise<CSpellSettingsI | undefined> {
        const configFile = await this.searchForConfigFile(searchFrom);
        if (!configFile) return undefined;

        return this.mergeConfigFileWithImports(configFile, pnpSettings);
    }

    public getGlobalSettings(): CSpellSettingsI {
        assert(this.globalSettings, 'Global settings not loaded');
        return this.globalSettings;
    }

    public async getGlobalSettingsAsync(): Promise<CSpellSettingsI> {
        if (!this.globalSettings) {
            const globalConfFile = await getGlobalConfig();
            const normalized = await this.mergeConfigFileWithImports(globalConfFile, undefined);
            normalized.id ??= 'global_config';
            this.globalSettings = normalized;
        }
        return this.globalSettings;
    }

    public clearCachedSettingsFiles(): void {
        this.globalSettings = undefined;
        this.cachedConfig.clear();
        this.cachedConfigFiles.clear();
        this.configSearch.clearCache();
        this.cachedPendingConfigFile.clear();
        this.cspellConfigFileReaderWriter.clearCachedFiles();
        this.cachedMergedConfig = new WeakMap<CSpellConfigFile, CacheMergeConfigFileWithImports>();
        this.prefetchGlobalSettingsAsync();
    }

    protected prefetchGlobalSettingsAsync(): Promise<void> {
        this.onReady = this.getGlobalSettingsAsync().then(
            () => undefined,
            (e) => logError(e),
        );
        return this.onReady;
    }

    protected importSettings(
        fileRef: ImportFileRef,
        pnpSettings: PnPSettingsOptional | undefined,
        backReferences: string[],
    ): ImportedConfigEntry {
        const url = this.cspellIO.toFileURL(fileRef.filename);
        const cacheKey = url.href;
        const cachedImport = this.cachedConfig.get(cacheKey);
        if (cachedImport) {
            backReferences.forEach((ref) => cachedImport.referencedSet.add(ref));
            return cachedImport;
        }

        if (fileRef.error) {
            const settings = csi({
                __importRef: fileRef,
                source: { name: fileRef.filename, filename: fileRef.filename },
            });
            const importedConfig: ImportedConfigEntry = {
                href: cacheKey,
                fileRef,
                configFile: undefined,
                settings,
                isReady: true,
                onReady: Promise.resolve(settings),
                onConfigFileReady: Promise.resolve(fileRef.error),
                referencedSet: new Set(backReferences),
            };
            this.cachedConfig.set(cacheKey, importedConfig);
            return importedConfig;
        }

        const source: Source = {
            name: fileRef.filename,
            filename: fileRef.filename,
        };

        const mergeImports = (cfgFile: CSpellConfigFile | Error) => {
            if (cfgFile instanceof Error) {
                fileRef.error = cfgFile;
                return csi({ __importRef: fileRef, source });
            }
            return this.mergeConfigFileWithImports(cfgFile, pnpSettings, backReferences);
        };

        const referencedSet = new Set(backReferences);
        const onConfigFileReady = onConfigFileReadyFixUp(this.readConfigFile(fileRef.filename));

        const importedConfig: ImportedConfigEntry = {
            href: cacheKey,
            fileRef,
            configFile: undefined,
            settings: undefined,
            isReady: false,
            onReady: onReadyFixUp(onConfigFileReady.then(mergeImports)),
            onConfigFileReady,
            referencedSet,
        };

        this.cachedConfig.set(cacheKey, importedConfig);
        return importedConfig;

        async function onReadyFixUp(pSettings: Promise<CSpellSettingsI>): Promise<CSpellSettingsI> {
            const settings = await pSettings;
            settings.source ??= source;
            settings.__importRef ??= fileRef;
            importedConfig.isReady = true;
            importedConfig.settings = settings;
            return settings;
        }

        async function onConfigFileReadyFixUp(
            pCfgFile: Promise<CSpellConfigFile | Error>,
        ): Promise<CSpellConfigFile | Error> {
            const cfgFile = await pCfgFile;
            if (cfgFile instanceof Error) {
                importedConfig.fileRef.error = cfgFile;
                return cfgFile;
            }
            source.name = cfgFile.settings.name || source.name;
            importedConfig.configFile = cfgFile;
            return cfgFile;
        }
    }

    private async setupPnp(cfgFile: CSpellConfigFile, pnpSettings: PnPSettingsOptional | undefined) {
        if (!pnpSettings?.usePnP || pnpSettings === defaultPnPSettings) return;
        if (cfgFile.url.protocol !== 'file:') return;

        // Try to load any .pnp files before reading dictionaries or other config files.
        const { usePnP = pnpSettings.usePnP, pnpFiles = pnpSettings.pnpFiles } = cfgFile.settings;
        const pnpSettingsToUse: PnPSettingsOptional = normalizePnPSettings({ usePnP, pnpFiles });
        const pathToSettingsDir = new URL('.', cfgFile.url);
        await loadPnP(pnpSettingsToUse, pathToSettingsDir);
    }

    public mergeConfigFileWithImports(
        cfgFile: CSpellConfigFile,
        pnpSettings: PnPSettingsOptional | undefined,
        referencedBy?: string[] | undefined,
    ): Promise<CSpellSettingsI> {
        const cached = this.cachedMergedConfig.get(cfgFile);
        if (cached && cached.pnpSettings === pnpSettings && cached.referencedBy === referencedBy) {
            return cached.result;
        }
        // console.warn('missing cache %o', cfgFile.url.href);

        const result = this._mergeConfigFileWithImports(cfgFile, pnpSettings, referencedBy);
        this.cachedMergedConfig.set(cfgFile, { pnpSettings, referencedBy, result });
        return result;
    }

    private async _mergeConfigFileWithImports(
        cfgFile: CSpellConfigFile,
        pnpSettings: PnPSettingsOptional | undefined,
        referencedBy: string[] = [],
    ): Promise<CSpellSettingsI> {
        await this.setupPnp(cfgFile, pnpSettings);

        const href = cfgFile.url.href;

        const referencedSet = new Set(referencedBy);
        const imports = normalizeImport(cfgFile.settings.import);

        const __imports = imports.map((name) => resolveFilename(name, cfgFile.url));

        const toImport = __imports.map((ref) => this.importSettings(ref, pnpSettings, [...referencedBy, href]));

        // Add ourselves to the import sources.
        toImport.forEach((entry) => {
            entry.referencedSet.add(href);
        });

        const pendingImports: (Promise<CSpellSettingsI> | CSpellUserSettings)[] = toImport.map((entry) => {
            // Detect circular references, return raw settings if circular.
            return referencedSet.has(entry.href)
                ? entry.settings || configToRawSettings(entry.configFile)
                : entry.onReady;
        });

        const importSettings = await Promise.all(pendingImports);
        const cfg = this.mergeImports(cfgFile, importSettings);
        return cfg;
    }

    /**
     * normalizeSettings handles correcting all relative paths, anchoring globs, and importing other config files.
     * @param rawSettings - raw configuration settings
     * @param pathToSettingsFile - path to the source file of the configuration settings.
     */
    protected mergeImports(cfgFile: CSpellConfigFile, importedSettings: CSpellUserSettings[]): CSpellSettingsI {
        const rawSettings = configToRawSettings(cfgFile);

        const url = cfgFile.url;
        const fileRef = rawSettings.__importRef;
        const source = rawSettings.source;

        assert(source);

        // Fix up dictionaryDefinitions
        const settings = {
            version: defaultSettings.version,
            ...rawSettings,
            globRoot: resolveGlobRoot(rawSettings, cfgFile.url),
            languageSettings: normalizeLanguageSettings(rawSettings.languageSettings),
        };

        const normalizedDictionaryDefs = normalizeDictionaryDefs(settings, url);
        const normalizedSettingsGlobs = normalizeSettingsGlobs(settings, url);
        const normalizedOverrides = normalizeOverrides(settings, url);
        const normalizedReporters = normalizeReporters(settings, url);
        const normalizedGitignoreRoot = normalizeGitignoreRoot(settings, url);
        const normalizedCacheSettings = normalizeCacheSettings(settings, url);

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
        if (!importedSettings.length) {
            return fileSettings;
        }

        const mergedImportedSettings = importedSettings.reduce((a, b) => mergeSettings(a, b));
        const finalizeSettings = mergeSettings(mergedImportedSettings, fileSettings);
        finalizeSettings.name = settings.name || finalizeSettings.name || '';
        finalizeSettings.id = settings.id || finalizeSettings.id || '';
        if (fileRef) {
            finalizeSettings.__importRef = fileRef;
        }
        return finalizeSettings;
    }

    createCSpellConfigFile(filename: URL | string, settings: CSpellUserSettings): CSpellConfigFile {
        return new CSpellConfigFileInMemory(this.cspellIO.toFileURL(filename), settings);
    }

    dispose() {
        while (this.toDispose.length) {
            try {
                this.toDispose.pop()?.dispose();
            } catch (e) {
                logError(e);
            }
        }
    }

    getStats() {
        return { ...getMergeStats() };
    }
}

class ConfigLoaderInternal extends ConfigLoader {
    constructor(vfs: FileSystem) {
        super(vfs);
    }

    get _cachedFiles() {
        return this.cachedConfig;
    }
}

export function loadPnP(pnpSettings: PnPSettingsOptional, searchFrom: URL): Promise<LoaderResult> {
    if (!pnpSettings.usePnP) {
        return Promise.resolve(undefined);
    }
    const loader = pnpLoader(pnpSettings.pnpFiles);
    return loader.load(searchFrom);
}

function resolveFilename(filename: string | URL, relativeTo: string | URL): ImportFileRef {
    if (filename instanceof URL) return { filename: toFilePathOrHref(filename) };
    const r = resolveFile(filename, relativeTo);

    if (r.warning) {
        logWarning(r.warning);
    }

    return {
        filename: r.filename.startsWith('file:/') ? fileURLToPath(r.filename) : r.filename,
        error: r.found ? undefined : new Error(`Failed to resolve file: "${filename}"`),
    };
}

const nestedConfigDirectories: Record<string, true> = {
    '.vscode': true,
    '.config': true, // this should be removed in the future, but it is a breaking change.
};

function resolveGlobRoot(settings: CSpellSettingsWST, urlSettingsFile: URL): string {
    const urlSettingsFileDir = new URL('.', urlSettingsFile);
    const uriSettingsFileDir = URI.parse(urlSettingsFileDir.href);

    const settingsFileDirName = UriUtils.basename(uriSettingsFileDir);

    const isNestedConfig = settingsFileDirName in nestedConfigDirectories;
    const isVSCode = settingsFileDirName === '.vscode';
    const settingsFileDir = (isNestedConfig ? UriUtils.dirname(uriSettingsFileDir) : uriSettingsFileDir).toString();
    const envGlobRoot = process.env[ENV_CSPELL_GLOB_ROOT];
    const defaultGlobRoot = envGlobRoot ?? '${cwd}';
    const rawRoot =
        settings.globRoot ??
        (settings.version === configSettingsFileVersion0_1 ||
        (envGlobRoot && !settings.version) ||
        (isVSCode && !settings.version)
            ? defaultGlobRoot
            : settingsFileDir);

    const globRoot = rawRoot.startsWith('${cwd}') ? rawRoot : resolveFileWithURL(rawRoot, new URL(settingsFileDir));

    return typeof globRoot === 'string'
        ? globRoot
        : globRoot.protocol === 'file:'
          ? windowsDriveLetterToUpper(path.resolve(fileURLToPath(globRoot)))
          : addTrailingSlash(globRoot).href;
}

function validationMessage(msg: string, url: URL) {
    return msg + `\n  File: "${toFilePathOrHref(url)}"`;
}

function validateRawConfigVersion(config: CSpellConfigFile): void {
    const { version } = config.settings;

    if (version === undefined) return;

    if (typeof version !== 'string') {
        logError(validationMessage(`Unsupported config file version: "${version}", string expected`, config.url));
        return;
    }

    if (setOfSupportedConfigVersions.has(version)) return;

    if (!/^\d+(\.\d+)*$/.test(version)) {
        logError(validationMessage(`Unsupported config file version: "${version}"`, config.url));
        return;
    }

    const msg =
        version > currentSettingsFileVersion
            ? `Newer config file version found: "${version}". Supported version is "${currentSettingsFileVersion}"`
            : `Legacy config file version found: "${version}", upgrade to "${currentSettingsFileVersion}"`;

    logWarning(validationMessage(msg, config.url));
}

function createConfigLoaderInternal(vfs?: FileSystem) {
    return new ConfigLoaderInternal(vfs ?? getVirtualFS().fs);
}

export function createConfigLoader(vfs?: FileSystem): IConfigLoader {
    return createConfigLoaderInternal(vfs);
}

export function getDefaultConfigLoaderInternal(): ConfigLoaderInternal {
    if (defaultConfigLoader) return defaultConfigLoader;

    return (defaultConfigLoader = createConfigLoaderInternal());
}

function createIO(fs: FileSystem): IO {
    const readFile = (url: URL) =>
        fs.readFile(url).then((file) => ({ url: file.url, content: createTextFileResource(file).getText() }));
    const writeFile = (file: TextFile) => fs.writeFile(file);
    return {
        readFile,
        writeFile,
    };
}

async function isDirectory(fs: FileSystem, path: URL): Promise<boolean> {
    try {
        return (await fs.stat(path)).isDirectory();
    } catch (e) {
        return false;
    }
}

export const __testing__ = {
    getDefaultConfigLoaderInternal,
    normalizeCacheSettings,
    validateRawConfigVersion,
    resolveGlobRoot,
};
