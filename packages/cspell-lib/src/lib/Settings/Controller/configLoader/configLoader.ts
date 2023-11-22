import type { CSpellUserSettings, ImportFileRef, Source } from '@cspell/cspell-types';
import { StrongWeakMap } from '@cspell/strong-weak-map';
import assert from 'assert';
import type { CSpellConfigFile, CSpellConfigFileReaderWriter, IO, TextFile } from 'cspell-config-lib';
import { createReaderWriter, CSpellConfigFileInMemory } from 'cspell-config-lib';
import type { CSpellIO } from 'cspell-io';
import { getDefaultCSpellIO } from 'cspell-io';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { createCSpellSettingsInternal as csi } from '../../../Models/CSpellSettingsInternalDef.js';
import { toError } from '../../../util/errors.js';
import { logError, logWarning } from '../../../util/logger.js';
import { resolveFile } from '../../../util/resolveFile.js';
import { cwdURL, toFilePathOrHref, toFileUrl } from '../../../util/url.js';
import {
    configSettingsFileVersion0_1,
    configSettingsFileVersion0_2,
    currentSettingsFileVersion,
    ENV_CSPELL_GLOB_ROOT,
} from '../../constants.js';
import { mergeSettings } from '../../CSpellSettingsServer.js';
import { defaultSettingsLoader } from '../../DefaultSettings.js';
import { getGlobalConfig } from '../../GlobalSettings.js';
import { ImportError } from '../ImportError.js';
import type { LoaderResult } from '../pnpLoader.js';
import { pnpLoader } from '../pnpLoader.js';
import { ConfigSearch } from './configSearch.js';
import { configErrorToRawSettings, configToRawSettings } from './configToRawSettings.js';
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

const gcl = getDefaultConfigLoaderInternal;

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
    'cspell.config.mjs',
    'cspell.config.js',
    'cspell.config.cjs',
    '.cspell.config.mjs',
    '.cspell.config.js',
    '.cspell.config.cjs',
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
    '.config/cspell.config.mjs',
    '.config/cspell.config.js',
    '.config/cspell.config.cjs',
    '.config/.cspell.config.mjs',
    '.config/.cspell.config.js',
    '.config/.cspell.config.cjs',
]);

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

export const defaultConfigFilenames = Object.freeze(searchPlaces.concat());

let defaultConfigLoader: ConfigLoaderInternal | undefined = undefined;

export class ConfigLoader {
    public onReady: Promise<void>;

    /**
     * Use `createConfigLoader`
     * @param cspellIO - CSpellIO interface for reading files.
     */
    protected constructor(readonly cspellIO: CSpellIO) {
        this.cspellConfigFileReaderWriter = createReaderWriter(undefined, undefined, createIO(cspellIO));
        this.onReady = this.getGlobalSettingsAsync().then(
            () => undefined,
            (e) => logError(e),
        );
    }

    protected cachedConfig = new Map<string, ImportedConfigEntry>();
    protected cachedConfigFiles = new Map<string, CSpellConfigFile>();
    protected cachedPendingConfigFile = new StrongWeakMap<string, Promise<CSpellConfigFile>>();
    protected globalSettings: CSpellSettingsI | undefined;
    protected cspellConfigFileReaderWriter: CSpellConfigFileReaderWriter;
    protected configSearch = new ConfigSearch(searchPlaces);

    public async readSettingsAsync(
        filename: string | URL,
        relativeTo?: string | URL,
        pnpSettings?: PnPSettingsOptional,
    ): Promise<CSpellSettingsI> {
        await defaultSettingsLoader.onReady();
        const ref = resolveFilename(filename, relativeTo || process.cwd());
        const entry = this.importSettings(ref, pnpSettings || defaultPnPSettings, []);
        return entry.onReady;
    }

    public async readConfigFile(
        filenameOrURL: string | URL,
        relativeTo?: string | URL,
    ): Promise<CSpellConfigFile | Error> {
        await defaultSettingsLoader.onReady();
        const ref = resolveFilename(filenameOrURL.toString(), relativeTo || process.cwd());
        const url = this.cspellIO.toFileURL(ref.filename);
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
            validateRawConfigVersion(file);
            return file;
        } catch (error) {
            // console.warn('Debug: %o', { href, error });
            return new ImportError(`Failed to read config file: "${ref.filename}"`, error);
        } finally {
            this.cachedPendingConfigFile.delete(href);
        }
    }

    searchForConfigFileLocation(searchFrom: URL | string | undefined): Promise<URL | undefined> {
        const url = this.cspellIO.toFileURL(searchFrom || cwdURL());
        return this.configSearch.searchForConfig(url);
    }

    async searchForConfigFile(searchFrom: URL | string | undefined): Promise<CSpellConfigFile | undefined> {
        await defaultSettingsLoader.onReady();
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
        await defaultSettingsLoader.onReady();
        const configFile = await this.searchForConfigFile(searchFrom);
        if (!configFile) return undefined;

        return this.mergeConfigFileWithImports(configFile, pnpSettings);
    }

    public getGlobalSettings(): CSpellSettingsI {
        assert(this.globalSettings);
        return this.globalSettings;
    }

    public async getGlobalSettingsAsync(): Promise<CSpellSettingsI> {
        await defaultSettingsLoader.onReady();
        if (!this.globalSettings) {
            const globalConfFile = await getGlobalConfig();
            const normalized = await this.mergeConfigFileWithImports(globalConfFile, {});
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
        this.cspellConfigFileReaderWriter.clearCachedFiles();
    }

    protected importSettings(
        fileRef: ImportFileRef,
        pnpSettings: PnPSettingsOptional,
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

    private async setupPnp(cfgFile: CSpellConfigFile, pnpSettings: PnPSettingsOptional) {
        if (cfgFile.url.protocol !== 'file:') return;

        // Try to load any .pnp files before reading dictionaries or other config files.
        const { usePnP = pnpSettings.usePnP, pnpFiles = pnpSettings.pnpFiles } = cfgFile.settings;
        const pnpSettingsToUse: PnPSettingsOptional = normalizePnPSettings({ usePnP, pnpFiles });
        const pathToSettingsDir = new URL('.', cfgFile.url);
        loadPnPSync(pnpSettingsToUse, pathToSettingsDir);
    }

    public async mergeConfigFileWithImports(
        cfgFile: CSpellConfigFile,
        pnpSettings: PnPSettingsOptional,
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

        assert(fileRef);
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
        finalizeSettings.__importRef = fileRef;
        return finalizeSettings;
    }

    createCSpellConfigFile(filename: URL | string, settings: CSpellUserSettings): CSpellConfigFile {
        return new CSpellConfigFileInMemory(this.cspellIO.toFileURL(filename), settings);
    }
}

class ConfigLoaderInternal extends ConfigLoader {
    constructor(cspellIO: CSpellIO) {
        super(cspellIO);
    }

    get _cachedFiles() {
        return this.cachedConfig;
    }
}

/**
 *
 * @param searchFrom the directory / file to start searching from.
 * @param pnpSettings - related to Using Yarn PNP.
 * @returns the resulting settings
 */
export function searchForConfig(
    searchFrom: URL | string | undefined,
    pnpSettings: PnPSettingsOptional = defaultPnPSettings,
): Promise<CSpellSettingsI | undefined> {
    return gcl().searchForConfig(searchFrom, pnpSettings);
}

/**
 * Load a CSpell configuration files.
 * @param file - path or package reference to load.
 * @param pnpSettings - PnP settings
 * @returns normalized CSpellSettings
 */
export async function loadConfig(file: string, pnpSettings?: PnPSettingsOptional): Promise<CSpellSettingsI> {
    return gcl().readSettingsAsync(file, undefined, pnpSettings);
}

export function loadPnP(pnpSettings: PnPSettingsOptional, searchFrom: URL): Promise<LoaderResult> {
    if (!pnpSettings.usePnP) {
        return Promise.resolve(undefined);
    }
    const loader = pnpLoader(pnpSettings.pnpFiles);
    return loader.load(searchFrom);
}

export function loadPnPSync(pnpSettings: PnPSettingsOptional, searchFrom: URL): LoaderResult {
    if (!pnpSettings.usePnP) {
        return undefined;
    }
    const loader = pnpLoader(pnpSettings.pnpFiles);
    return loader.loadSync(searchFrom);
}

export async function readRawSettings(filename: string | URL, relativeTo?: string | URL): Promise<CSpellSettingsWST> {
    try {
        const cfg = await readConfigFile(filename, relativeTo);
        return configToRawSettings(cfg);
    } catch (e) {
        return configErrorToRawSettings(toError(e), toFileUrl(filename));
    }
}

export async function readConfigFile(filename: string | URL, relativeTo?: string | URL): Promise<CSpellConfigFile> {
    const result = await gcl().readConfigFile(filename, relativeTo);
    if (result instanceof Error) {
        throw result;
    }
    return result;
}

function resolveFilename(filename: string | URL, relativeTo: string | URL): ImportFileRef {
    if (filename instanceof URL) return { filename: toFilePathOrHref(filename) };
    const r = resolveFile(filename, relativeTo);

    return {
        filename: r.filename.startsWith('file:/') ? fileURLToPath(r.filename) : r.filename,
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

function resolveGlobRoot(settings: CSpellSettingsWST, urlSettingsFile: URL): string {
    const pathToSettingsFile = fileURLToPath(urlSettingsFile);
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

function createIO(cspellIO: CSpellIO): IO {
    const readFile = (url: URL) => cspellIO.readFile(url).then((file) => ({ url: file.url, content: file.getText() }));
    const writeFile = (file: TextFile) => cspellIO.writeFile(file.url, file.content);
    return {
        readFile,
        writeFile,
    };
}

export function urlToSimpleId(url: URL): string {
    return url.pathname.split('/').slice(-2).join('/');
}

export const __testing__ = {
    getDefaultConfigLoaderInternal,
    normalizeCacheSettings,
    validateRawConfigVersion,
};
