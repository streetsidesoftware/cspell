import * as iPath from 'node:path';

import chalk from 'chalk';

import type { TraceResult } from '../application.mjs';
import { console } from '../console.js';
import { TableRow, tableToLines } from '../util/table.js';
import type { DictionaryPathFormat } from './DictionaryPathFormat.js';
import { formatDictionaryLocation, type PathInterface } from './helpers.js';

export interface EmitTraceOptions {
    /** current working directory */
    cwd: string;
    lineWidth?: number;
    dictionaryPathFormat: DictionaryPathFormat;
    iPath?: PathInterface;
    prefix?: string;
    showWordFound?: boolean;
    color?: boolean | undefined;
}

const maxWidth = 120;

const colWidthDictionaryName = 20;

export function emitTraceResults(
    word: string,
    found: boolean,
    results: TraceResult[],
    options: EmitTraceOptions,
): void {
    const report = calcTraceResultsReport(word, found, results, options);
    console.log(report.table);
    if (report.errors) {
        console.error('Errors:');
        console.error(report.errors);
    }
}

export function calcTraceResultsReport(
    word: string,
    found: boolean,
    results: TraceResult[],
    options: EmitTraceOptions,
): { table: string; errors: string } {
    if (options.color === true) {
        chalk.level = 2;
    } else if (options.color === false) {
        chalk.level = 0;
    }
    const col = new Intl.Collator();
    results.sort((a, b) => col.compare(a.dictName, b.dictName));

    options.showWordFound && console.log(`${options.prefix || ''}${word}: ${found ? 'Found' : 'Not Found'}`);
    const header = emitHeader(options.dictionaryPathFormat !== 'hide');
    const rows = results.map((r) => emitTraceResult(r, options));

    const t = tableToLines({
        header,
        rows,
        terminalWidth: options.lineWidth || process.stdout.columns || maxWidth,
        deliminator: ' ',
    });

    return {
        table: t.map((line) => line.trimEnd()).join('\n'),
        errors: emitErrors(results).join('\n'),
    };
}

function emitHeader(location: boolean): string[] {
    const headers = ['Word', 'F', 'Dictionary'];

    location && headers.push('Dictionary Location');

    return headers;
}

function emitTraceResult(r: TraceResult, options: EmitTraceOptions): TableRow {
    const errors = !!r.errors?.length;
    const word = r.foundWord || r.word;
    const cWord = word.replaceAll('+', chalk.yellow('+'));
    const sug = r.preferredSuggestions?.map((s) => chalk.yellowBright(s)).join(', ') || '';
    const w = (r.forbidden ? chalk.red(cWord) : chalk.green(cWord)) + (sug ? `->(${sug})` : '');
    const f = calcFoundChar(r);
    const a = r.dictActive ? '*' : ' ';
    const dictName = r.dictName.slice(0, colWidthDictionaryName - 1) + a;
    const dictColor = r.dictActive ? chalk.yellowBright : chalk.rgb(200, 128, 50);
    const n = dictColor(dictName);
    const c = colorize(errors ? chalk.red : chalk.white);
    return [
        w,
        f,
        n,
        (widthSrc) => c(formatDictionaryLocation(r.dictSource, widthSrc ?? maxWidth, { iPath, ...options })),
    ];
}

function emitErrors(results: TraceResult[]): string[] {
    const errorResults = results.filter((r) => r.errors?.length);

    return errorResults.map((r) => {
        const errors = r.errors?.map((e) => e.message)?.join('\n\t') || '';
        return chalk.bold(r.dictName) + '\n\t' + chalk.red(errors);
    });
}

function calcFoundChar(r: TraceResult): string {
    const errors = r.errors?.map((e) => e.message)?.join('\n\t') || '';

    let color = chalk.dim;
    color = r.found ? chalk.whiteBright : color;
    color = r.forbidden ? chalk.red : color;
    color = r.noSuggest ? chalk.yellowBright : color;
    color = errors ? chalk.red : color;

    let char = '-';
    char = r.found ? '*' : char;
    char = r.forbidden ? '!' : char;
    char = r.noSuggest ? 'I' : char;
    char = errors ? 'X' : char;

    return color(char);
}

function colorize(fn: (s: string) => string): (s: string) => string {
    return (s: string) => (s ? fn(s) : '');
}
