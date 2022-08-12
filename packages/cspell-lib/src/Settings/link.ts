import type { CSpellSettingsWithSourceTrace } from '@cspell/cspell-types';
import * as fs from 'fs';
import * as Path from 'path';
import { clean } from '../util/util';
import { readRawSettings } from './Controller/configLoader';
import { getRawGlobalSettings, writeRawGlobalSettings } from './GlobalSettings';

export interface ListGlobalImportsResult {
    filename: string;
    name: string | undefined;
    id: string | undefined;
    error: string | undefined;
    dictionaryDefinitions: CSpellSettingsWithSourceTrace['dictionaryDefinitions'];
    languageSettings: CSpellSettingsWithSourceTrace['languageSettings'];
    package: NodePackage | undefined;
}

export interface ListGlobalImportsResults {
    list: ListGlobalImportsResult[];
    globalSettings: CSpellSettingsWithSourceTrace;
}

interface NodePackage {
    name: string | undefined;
    filename: string;
}

export function listGlobalImports(): ListGlobalImportsResults {
    const globalSettings = getRawGlobalSettings();
    const list = resolveImports(globalSettings).map(({ filename, settings, error }) => ({
        filename,
        error,
        id: settings.id,
        name: settings.name,
        dictionaryDefinitions: settings.dictionaryDefinitions,
        languageSettings: settings.languageSettings,
        package: findPackageForCSpellConfig(Path.dirname(filename)),
    }));

    return {
        list,
        globalSettings,
    };
}

export interface AddPathsToGlobalImportsResults {
    success: boolean;
    resolvedSettings: ResolveSettingsResult[];
    error: string | undefined;
}

function isString(s: string | undefined): s is string {
    return s !== undefined;
}

export function addPathsToGlobalImports(paths: string[]): AddPathsToGlobalImportsResults {
    const resolvedSettings = paths.map(resolveSettings);
    const hasError = resolvedSettings.filter((r) => !!r.error).length > 0;
    if (hasError) {
        return {
            success: false,
            resolvedSettings,
            error: 'Unable to resolve files.',
        };
    }

    const rawGlobalSettings = getRawGlobalSettings();
    const resolvedImports = resolveImports(rawGlobalSettings);

    const imports = new Set(resolvedImports.map((r) => r.resolvedToFilename || r.filename));
    resolvedSettings
        .map((s) => s.resolvedToFilename)
        .filter(isString)
        .reduce((imports, s) => imports.add(s), imports);

    const globalSettings = {
        import: [...imports],
    };

    const error = writeRawGlobalSettings(globalSettings);
    return {
        success: !error,
        error: error?.message,
        resolvedSettings,
    };
}

export interface RemovePathsFromGlobalImportsResult {
    success: boolean;
    error: string | undefined;
    removed: string[];
}

/**
 * Remove files from the global setting.
 * @param paths match against the partial file path, or package name, or id.
 *   To match against a partial file path, it must match against the subdirectory and filename.
 * Note: for Idempotent reasons, asking to remove a path that is not in the global settings is considered a success.
 *   It is possible to check for this by looking at the returned list of removed paths.
 */
export function removePathsFromGlobalImports(paths: string[]): RemovePathsFromGlobalImportsResult {
    const listResult = listGlobalImports();

    const toRemove = new Set<string>();

    type TestResultToExclude = (r: ListGlobalImportsResult) => boolean;

    function matchPackage(pathToRemove: string): TestResultToExclude {
        return ({ package: pkg, id }) => pathToRemove === pkg?.name || pathToRemove === id;
    }

    function compareFilenames(fullPath: string, partialPath: string): boolean {
        if (fullPath === partialPath) return true;
        if (!fullPath.endsWith(partialPath)) return false;
        const c = fullPath[fullPath.length - partialPath.length - 1];
        return c === Path.sep || c === Path.posix.sep;
    }

    function matchFilename(pathToRemove: string): TestResultToExclude {
        return Path.dirname(pathToRemove) != '.'
            ? ({ filename }) => compareFilenames(filename, pathToRemove)
            : () => false;
    }

    paths
        .map((a) => a.trim())
        .filter((a) => !!a)
        .forEach((pathToRemove) => {
            const excludePackage = matchPackage(pathToRemove);
            const excludeFilename = matchFilename(pathToRemove);
            const shouldExclude: TestResultToExclude = (r) => excludePackage(r) || excludeFilename(r);
            for (const r of listResult.list) {
                if (shouldExclude(r)) {
                    toRemove.add(r.filename);
                }
            }
        });

    const toImport = normalizeImports(listResult.globalSettings.import).filter((p) => !toRemove.has(p));

    const updatedSettings = {
        import: toImport,
    };

    const error = toRemove.size > 0 ? writeRawGlobalSettings(updatedSettings) : undefined;

    return {
        success: true,
        removed: [...toRemove],
        error: error?.toString(),
    };
}

export interface ResolveSettingsResult {
    filename: string;
    resolvedToFilename: string | undefined;
    error?: string;
    settings: CSpellSettingsWithSourceTrace;
}

function resolveSettings(filename: string): ResolveSettingsResult {
    const settings = readRawSettings(filename);
    const ref = settings.__importRef;
    const resolvedToFilename = ref?.filename;
    const error = ref?.error?.message || (!resolvedToFilename && 'File not Found') || undefined;

    return clean({
        filename,
        resolvedToFilename,
        error,
        settings,
    });
}

function normalizeImports(imports: CSpellSettingsWithSourceTrace['import']): string[] {
    return typeof imports === 'string' ? [imports] : imports || [];
}

function resolveImports(s: CSpellSettingsWithSourceTrace): ResolveSettingsResult[] {
    const imported = normalizeImports(s.import);

    return imported.map(resolveSettings);
}

function findPackageForCSpellConfig(pathToConfig: string): NodePackage | undefined {
    try {
        const filename = Path.join(pathToConfig, 'package.json');
        const pkg = JSON.parse(fs.readFileSync(filename, 'utf8'));
        return {
            filename,
            name: pkg['name'],
        };
    } catch (e) {
        return undefined;
    }
}

export const __testing__ = {
    findPackageForCSpellConfig,
};
