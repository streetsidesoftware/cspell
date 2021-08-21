import { TraceResult } from './application';
import chalk = require('chalk');
import * as Path from 'path';

export interface EmitTraceOptions {
    /** current working directory */
    cwd: string;
}

const colWidthDictionaryName = 20;

export function emitTraceResults(results: TraceResult[], options: EmitTraceOptions): void {
    const maxWordLength = results
        .map((r) => r.foundWord || r.word)
        .reduce((a, b) => Math.max(a, b.length), 'Word'.length);

    const cols: ColWidths = {
        word: maxWordLength,
        dictName: colWidthDictionaryName,
        terminalWidth: process.stdout.columns || 120,
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
}

function emitHeader(colWidths: ColWidths): void {
    const line = [
        pad('Word', colWidths.word),
        'F',
        pad('Dictionary', colWidths.dictName),
        pad('Dictionary Location', 30),
    ];
    console.log(chalk.underline(line.join(' ')));
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
    const used = [r.word.length, 1, widthName].reduce((a, b) => a + b, 3);
    const widthSrc = terminalWidth - used;
    const c = errors ? chalk.red : chalk.white;
    const s = c(formatDictionaryLocation(r.dictSource, widthSrc, options.cwd));
    const line = [w, f, n, s].join(' ');
    console.log(line);
    if (errors) {
        console.error('\t' + chalk.red(errors));
    }
}

function pad(s: string, w: number): string {
    return (s + ' '.repeat(w)).substr(0, w);
}

function trimMid(s: string, w: number): string {
    s = s.trim();
    if (s.length <= w) {
        return s;
    }
    const l = Math.floor((w - 3) / 2);
    const r = Math.ceil((w - 3) / 2);
    return s.substr(0, l) + '...' + s.substr(-r);
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

function formatDictionaryLocation(dictSource: string, maxWidth: number, cwd: string): string {
    const relPath = cwd ? Path.relative(cwd, dictSource) : dictSource;
    const usePath = relPath.length < dictSource.length ? relPath : dictSource;
    return trimMid(usePath, maxWidth);
}
