import chalk from 'chalk';
import { Link } from 'cspell-lib';

import type { Table } from './util/table';

export const listGlobalImports = Link.listGlobalImports;
export const addPathsToGlobalImports = Link.addPathsToGlobalImports;
export const removePathsFromGlobalImports = Link.removePathsFromGlobalImports;

export function listGlobalImportsResultToTable(results: Link.ListGlobalImportsResult[]): Table {
    const header = ['id', 'package', 'name', 'filename', 'dictionaries', 'errors'];
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

    return {
        header,
        rows: results.map(toColumns),
    };
}

export function addPathsToGlobalImportsResultToTable(results: Link.AddPathsToGlobalImportsResults): Table {
    const header = ['filename', 'errors'];
    const decorate = (isError: boolean) => (isError ? (s: string) => chalk.red(s) : (s: string) => s);

    function toColumns(r: Link.ResolveSettingsResult): string[] {
        return [r.resolvedToFilename || r.filename, r.error ? 'Failed to read file.' : '']
            .map((c) => c || '')
            .map(decorate(!!r.error));
    }

    return {
        header,
        rows: results.resolvedSettings.map(toColumns),
    };
}
