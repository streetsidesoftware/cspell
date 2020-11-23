import { Link } from 'cspell-lib';
import chalk from 'chalk';

export const listGlobalImports = Link.listGlobalImports;

export function listGlobalImportsResultToTable(results: Link.ListGlobalImportsResult[]): string[][] {
    const table: string[][] = [];
    const b = (s: string) => chalk.underline(chalk.bold(s));
    const header = ['id', 'package', 'name', 'filename', 'dictionaries', 'errors'].map(b);
    const decorate = (isError: boolean) => (isError ? (s: string) => chalk.red(s) : (s: string) => s);

    function toColumns(r: Link.ListGlobalImportsResult): string[] {
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

export const addPathsToGlobalImports = Link.addPathsToGlobalImports;

export function addPathsToGlobalImportsResultToTable(results: Link.AddPathsToGlobalImportsResults): string[][] {
    const table: string[][] = [];
    const b = (s: string) => chalk.underline(chalk.bold(s));
    const header = ['filename', 'errors'].map(b);
    const decorate = (isError: boolean) => (isError ? (s: string) => chalk.red(s) : (s: string) => s);

    function toColumns(r: Link.ResolveSettingsResult): string[] {
        return [r.resolvedToFilename || r.filename, r.error ? 'Failed to read file.' : '']
            .map((c) => c || '')
            .map(decorate(!!r.error));
    }

    table.push(header);
    results.resolvedSettings.map(toColumns).forEach((row) => table.push(row));
    return table;
}

export const removePathsFromGlobalImports = Link.removePathsFromGlobalImports;
