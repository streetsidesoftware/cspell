import * as iPath from 'node:path';

import chalk from 'chalk';

import type { ListDictionariesResult } from '../application.mjs';
import { console } from '../console.js';
import { TableRow, tableToLines } from '../util/table.js';
import type { DictionaryPathFormat } from './DictionaryPathFormat.js';
import { formatDictionaryLocation, type PathInterface } from './helpers.js';

export interface EmitDictOptions {
    /** current working directory */
    cwd: string;
    lineWidth?: number;
    dictionaryPathFormat: DictionaryPathFormat;
    iPath?: PathInterface;
    color?: boolean | undefined;
}

const maxWidth = 120;

const colWidthDictionaryName = 40;

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

    const header = emitHeader(options.dictionaryPathFormat !== 'hide');
    const rows = results.map((r) => emitDictResult(r, options));

    const t = tableToLines({
        header,
        rows,
        terminalWidth: options.lineWidth || process.stdout.columns || maxWidth,
        deliminator: ' ',
    });

    return {
        table: t.map((line) => line.trimEnd()).join('\n'),
        errors: '',
    };
}

function emitHeader(location: boolean): string[] {
    const headers = ['Dictionary'];

    location && headers.push('Dictionary Location');

    return headers;
}

function emitDictResult(r: ListDictionariesResult, options: EmitDictOptions): TableRow {
    const a = r.enabled ? '*' : ' ';
    const dictName = r.name.slice(0, colWidthDictionaryName - 1) + a;
    const dictColor = r.enabled ? chalk.yellowBright : chalk.rgb(200, 128, 50);
    const n = dictColor(dictName);
    const c = colorize(chalk.white);
    return [
        n,
        (widthSrc) =>
            c((r.path && formatDictionaryLocation(r.path, widthSrc ?? maxWidth, { iPath, ...options })) || ''),
    ];
}

function colorize(fn: (s: string) => string): (s: string) => string {
    return (s: string) => (s ? fn(s) : '');
}
