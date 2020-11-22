import { CSpellSettingsWithSourceTrace, getRawGlobalSettings, readSettings, writeRawGlobalSettings } from 'cspell-lib';
import chalk from 'chalk';
import * as Path from 'path';
import * as fs from 'fs';

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

export function listGlobalImportsResultToTable(results: ListGlobalImportsResult[]): string[][] {
    const table: string[][] = [];
    const b = (s: string) => chalk.underline(chalk.bold(s));
    const header = ['id', 'package', 'name', 'filename', 'dictionaries', 'errors'].map(b);
    const decorate = (isError: boolean) => (isError ? (s: string) => chalk.red(s) : (s: string) => s);

    function toColumns(r: ListGlobalImportsResult): string[] {
        return [
            r.id,
            r.package?.name,
            r.name,
            r.filename,
            r.dictionaryDefinitions?.map((def) => def.name).join(', '),
            r.error ? 'Failed to read file.' : '',
        ]
            .map((c) => c || '')
            .map(decorate(!!r.error));
    }

    table.push(header);
    results.map(toColumns).forEach((row) => table.push(row));
    return table;
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

export function addPathsToGlobalImportsResultToTable(results: AddPathsToGlobalImportsResults): string[][] {
    const table: string[][] = [];
    const b = (s: string) => chalk.underline(chalk.bold(s));
    const header = ['filename', 'errors'].map(b);
    const decorate = (isError: boolean) => (isError ? (s: string) => chalk.red(s) : (s: string) => s);

    function toColumns(r: ResolveSettingsResult): string[] {
        return [r.resolvedToFilename || r.filename, r.error ? 'Failed to read file.' : '']
            .map((c) => c || '')
            .map(decorate(!!r.error));
    }

    table.push(header);
    results.resolvedSettings.map(toColumns).forEach((row) => table.push(row));
    return table;
}

export interface RemovePathsFromGlobalImportsResult {
    success: boolean;
    error: string | undefined;
    removed: string[];
}

export function removePathsFromGlobalImports(paths: string[]): RemovePathsFromGlobalImportsResult {
    const listResult = listGlobalImports();

    const toRemove = new Set<string>();

    type TestResultToExclude = (r: ListGlobalImportsResult) => boolean;

    function matchPackage(pathToRemove: string): TestResultToExclude {
        return ({ package: pkg, id }) => pathToRemove === pkg?.name || pathToRemove === id;
    }

    function matchFilename(pathToRemove: string): TestResultToExclude {
        return Path.dirname(pathToRemove) ? ({ filename }) => filename.endsWith(pathToRemove) : () => false;
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

interface ResolveSettingsResult {
    filename: string;
    resolvedToFilename: string | undefined;
    error?: string;
    settings: CSpellSettingsWithSourceTrace;
}

function resolveSettings(filename: string): ResolveSettingsResult {
    const settings = readSettings(filename, {});
    const ref = settings.__importRef;

    return {
        filename,
        resolvedToFilename: ref?.filename,
        error: ref?.error?.message,
        settings,
    };
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
