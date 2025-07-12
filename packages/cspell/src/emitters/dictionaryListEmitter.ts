import * as iPath from 'node:path';

import chalk from 'chalk';

import { console } from '../console.js';
import type { ListDictionariesResult } from '../dictionaries/index.js';
import type { DictionariesOptions } from '../options.js';
import { pruneAnsiTextEnd, pruneAnsiTextStart } from '../util/pad.js';
import { TableCell, TableRow, tableToLines } from '../util/table.js';
import type { DictionaryPathFormat } from './DictionaryPathFormat.js';
import { formatDictionaryLocation, type PathInterface } from './helpers.js';

export interface EmitDictOptions {
    /** current working directory */
    cwd: string;
    lineWidth?: number;
    dictionaryPathFormat: DictionaryPathFormat;
    iPath?: PathInterface;
    color?: boolean | undefined;
    options: DictionariesOptions;
}

const maxWidth = 120;

export function emitListDictionariesResults(results: ListDictionariesResult[], options: EmitDictOptions): void {
    const report = calcListDictsResultsReport(results, options);
    console.log(report.table);
    if (report.errors) {
        console.error('Errors:');
        console.error(report.errors);
    }
}

export function calcListDictsResultsReport(
    results: ListDictionariesResult[],
    options: EmitDictOptions,
): { table: string; errors: string } {
    if (options.color === true) {
        chalk.level = 2;
    } else if (options.color === false) {
        chalk.level = 0;
    }
    const col = new Intl.Collator();
    results.sort((a, b) => col.compare(a.name, b.name));

    const header = calcHeaders(options);
    const rows = results.map((r) => dictTableRowToTableRow(emitDictResult(r, options)));

    const t = tableToLines({
        header,
        rows,
        terminalWidth: options.lineWidth || process.stdout.columns || maxWidth,
        deliminator: ' ',
        maxColumnWidths: {
            locales: 12,
            fileTypes: 40,
        },
    });

    return {
        table: t.map((line) => line.trimEnd()).join('\n'),
        errors: '',
    };
}

function calcHeaders(options: EmitDictOptions): [string, string][] {
    const showLocation = options.dictionaryPathFormat !== 'hide' && (options.options.showLocation ?? true);
    const showLocales = options.options.showLocales ?? true;
    const showFileTypes = options.options.showFileTypes ?? true;

    const headers: [string, string][] = [['name', 'Dictionary']];

    showLocales && headers.push(['locales', 'Locales']);
    showFileTypes && headers.push(['fileTypes', 'File Types']);

    showLocation && headers.push(['location', 'Dictionary Location']);

    return headers;
}

function emitDictResult(r: ListDictionariesResult, options: EmitDictOptions): DictTableRow {
    const a = r.enabled ? '*' : ' ';
    const dictColor = r.enabled ? chalk.yellowBright : chalk.rgb(200, 128, 50);
    const n = (width: number | undefined) => dictColor(pruneAnsiTextEnd(r.name, width && width - a.length) + a);
    const c = colorize(chalk.white);

    const locales = (width?: number) => c(pruneAnsiTextEnd(r.locales?.join(',') || '', width));
    const fileTypes = (width?: number) => c(pruneAnsiTextEnd(r.fileTypes?.join(',') || '', width));

    if (!r.path) {
        return {
            name: n,
            location: c(r.inline?.join(', ') || ''),
            locales,
            fileTypes,
        };
    }
    return {
        name: n,
        location: (widthSrc) =>
            c(
                (r.path &&
                    pruneAnsiTextStart(
                        formatDictionaryLocation(r.path, widthSrc ?? maxWidth, { iPath, ...options }),
                        widthSrc ?? maxWidth,
                    )) ||
                    '',
            ),
        locales,
        fileTypes,
    };
}

interface DictTableRow {
    name: TableCell;
    location: TableCell;
    locales: TableCell;
    fileTypes: TableCell;
}

function dictTableRowToTableRow(row: DictTableRow): TableRow {
    return Object.fromEntries(Object.entries(row));
}

function colorize(fn: (s: string) => string): (s: string) => string {
    return (s: string) => (s ? fn(s) : '');
}
