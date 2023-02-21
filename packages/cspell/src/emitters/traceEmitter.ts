import chalk from 'chalk';
import * as iPath from 'path';
import strip from 'strip-ansi';

import type { TraceResult } from '../application';
import { pad, width } from '../util/util';
import type { DictionaryPathFormat } from './DictionaryPathFormat';

interface PathInterface {
    relative(from: string, to: string): string;
    basename(path: string): string;
    sep: string;
}

export interface EmitTraceOptions {
    /** current working directory */
    cwd: string;
    lineWidth?: number;
    dictionaryPathFormat: DictionaryPathFormat;
    iPath?: PathInterface;
}

const colWidthDictionaryName = 20;

export function emitTraceResults(results: TraceResult[], options: EmitTraceOptions): void {
    const maxWordLength = results
        .map((r) => r.foundWord || r.word)
        .reduce((a, b) => Math.max(a, width(b)), 'Word'.length);

    const maxDictNameLength = results
        .map((r) => r.dictName.length)
        .reduce((a, b) => Math.max(a, b), colWidthDictionaryName);

    const cols: ColWidths = {
        word: maxWordLength,
        dictName: maxDictNameLength,
        terminalWidth: options.lineWidth ?? (process.stdout.columns || 120),
        location: options.dictionaryPathFormat === 'hide' ? 0 : 30,
    };

    const col = new Intl.Collator();
    results.sort((a, b) => col.compare(a.dictName, b.dictName));

    emitHeader(cols);
    results.forEach((r) => emitTraceResult(r, cols, options));
}

interface ColWidths {
    word: number;
    dictName: number;
    terminalWidth: number;
    location: number;
}

function emitHeader(colWidths: ColWidths): void {
    const line = [
        pad('Word', colWidths.word),
        'F',
        pad('Dictionary', colWidths.dictName),
        colWidths.location ? pad('Dictionary Location', colWidths.location) : '',
    ];
    console.log(chalk.underline(line.join(' ').trim().slice(0, colWidths.terminalWidth)));
}

function emitTraceResult(r: TraceResult, colWidths: ColWidths, options: EmitTraceOptions): void {
    const { word: wordColWidth, terminalWidth, dictName: widthName } = colWidths;
    const errors = r.errors?.map((e) => e.message)?.join('\n\t') || '';
    const word = pad(r.foundWord || r.word, wordColWidth);
    const cWord = word.replace(/[+]/g, chalk.yellow('+'));
    const w = r.forbidden ? chalk.red(cWord) : chalk.green(cWord);
    const f = calcFoundChar(r);
    const a = r.dictActive ? '*' : ' ';
    const dictName = pad(r.dictName.slice(0, widthName - 1) + a, widthName);
    const dictColor = r.dictActive ? chalk.yellowBright : chalk.rgb(200, 128, 50);
    const n = dictColor(dictName);
    const info = [w, f, n].join(' ') + ' ';
    const used = width(strip(info));
    const widthSrc = terminalWidth - used;
    const c = colorize(errors ? chalk.red : chalk.white);
    const s = c(formatDictionaryLocation(r.dictSource, widthSrc, { iPath, ...options }));
    const line = info + s;
    console.log(line.trim());
    if (errors) {
        console.error('\t' + chalk.red(errors));
    }
}

function trimMid(s: string, w: number): string {
    s = s.trim();
    if (s.length <= w) {
        return s;
    }
    const l = Math.floor((w - 3) / 2);
    const r = Math.ceil((w - 3) / 2);
    return s.slice(0, l) + '...' + s.slice(-r);
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

function formatDictionaryLocation(
    dictSource: string,
    maxWidth: number,
    {
        cwd,
        dictionaryPathFormat: format,
        iPath,
    }: {
        cwd: string;
        dictionaryPathFormat: DictionaryPathFormat;
        iPath: PathInterface;
    }
): string {
    let relPath = cwd ? iPath.relative(cwd, dictSource) : dictSource;
    const idxNodeModule = relPath.lastIndexOf('node_modules');
    const isNodeModule = idxNodeModule >= 0;
    if (format === 'hide') return '';
    if (format === 'short') {
        const prefix = isNodeModule
            ? '[node_modules]/'
            : relPath.startsWith('..' + iPath.sep + '..')
            ? '.../'
            : relPath.startsWith('..' + iPath.sep)
            ? '../'
            : '';
        return prefix + iPath.basename(dictSource);
    }
    if (format === 'full') return dictSource;
    relPath = isNodeModule ? relPath.slice(idxNodeModule) : relPath;
    const usePath = relPath.length < dictSource.length ? relPath : dictSource;
    return trimMidPath(usePath, maxWidth, iPath.sep);
}

function colorize(fn: (s: string) => string): (s: string) => string {
    return (s: string) => (s ? fn(s) : '');
}

function trimMidPath(s: string, w: number, sep: string): string {
    if (s.length <= w) return s;
    const parts = s.split(sep);
    if (parts[parts.length - 1].length > w) return trimMid(s, w);

    function join(left: number, right: number) {
        // if (left === right) return parts.join(sep);
        return [...parts.slice(0, left), '...', ...parts.slice(right)].join(sep);
    }

    let left = 0,
        right = parts.length,
        last = '';
    for (let i = 0; i < parts.length; ++i) {
        const incLeft = i & 1 ? 1 : 0;
        const incRight = incLeft ? 0 : -1;
        const next = join(left + incLeft, right + incRight);
        if (next.length > w) break;
        left += incLeft;
        right += incRight;
        last = next;
    }
    for (let i = left + 1; i < right; ++i) {
        const next = join(i, right);
        if (next.length > w) break;
        last = next;
    }
    for (let i = right - 1; i > left; --i) {
        const next = join(left, i);
        if (next.length > w) break;
        last = next;
    }
    return last || trimMid(s, w);
}

export const __testing__ = {
    trimMidPath,
};
