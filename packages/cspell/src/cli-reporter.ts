import chalk = require('chalk');
import type { CSpellReporter, Issue, MessageType, ProgressItem, RunResult } from '@cspell/cspell-types';
import { ImportError, isSpellingDictionaryLoadError, SpellingDictionaryLoadError } from 'cspell-lib';
import * as path from 'path';
import { Options } from './app';
import { URI } from 'vscode-uri';

const templateIssue = `{green $uri}:{yellow $row:$col} - $message ({red $text})`;
const templateIssueWithSuggestions = `{green $uri}:{yellow $row:$col} - $message ({red $text}) Suggestions: {yellow [$suggestions]}`;
const templateIssueWithContext = `{green $uri}:{yellow $row:$col} $padRowCol- $message ({red $text})$padContext -- {gray $contextLeft}{red {underline $text}}{gray $contextRight}`;
const templateIssueWithContextWithSuggestions = `{green $uri}:{yellow $row:$col} $padRowCol- $message ({red $text})$padContext -- {gray $contextLeft}{red {underline $text}}{gray $contextRight}\n\t Suggestions: {yellow [$suggestions]}`;
const templateIssueLegacy = `${chalk.green('$uri')}[$row, $col]: $message: ${chalk.red('$text')}`;
const templateIssueWordsOnly = '$text';

function genIssueEmitter(template: string) {
    const defaultWidth = 10;
    let maxWidth = defaultWidth;
    let uri: string | undefined;

    return function issueEmitter(issue: Issue) {
        if (uri !== issue.uri) {
            maxWidth = defaultWidth;
            uri = issue.uri;
        }
        maxWidth = Math.max(maxWidth * 0.999, issue.text.length, 10);
        console.log(formatIssue(template, issue, Math.ceil(maxWidth)));
    };
}

function errorEmitter(message: string, error: Error | SpellingDictionaryLoadError | ImportError) {
    if (isSpellingDictionaryLoadError(error)) {
        error = error.cause;
    }
    console.error(chalk.red(message), error.toString());
}

type InfoEmitter = Record<MessageType, (msg: string) => void>;

function nullEmitter() {
    /* empty */
}

function relativeFilename(filename: string, cwd = process.cwd()): string {
    const rel = path.relative(cwd, filename);
    if (rel.startsWith('..')) return filename;
    return '.' + path.sep + rel;
}

function relativeUriFilename(uri: string, fsPathRoot: string): string {
    const fsPath = URI.parse(uri).fsPath;
    const rel = path.relative(fsPathRoot, fsPath);
    if (rel.startsWith('..')) return fsPath;
    return '.' + path.sep + rel;
}

function reportProgress(p: ProgressItem) {
    if (p.type !== 'ProgressFileComplete') {
        return;
    }
    const fc = '' + p.fileCount;
    const fn = (' '.repeat(fc.length) + p.fileNum).slice(-fc.length);
    const idx = fn + '/' + fc;
    const filename = chalk.gray(relativeFilename(p.filename));
    const time = reportTime(p.elapsedTimeMs);
    const skipped = p.processed === false ? ' skipped' : '';
    const hasErrors = p.numErrors ? chalk.red` X` : '';
    console.error(`${idx} ${filename} ${time}${skipped}${hasErrors}`);
}

function reportTime(elapsedTimeMs: number | undefined): string {
    if (elapsedTimeMs === undefined) return '-';
    const color = elapsedTimeMs < 1000 ? chalk.white : elapsedTimeMs < 2000 ? chalk.yellow : chalk.redBright;
    return color(elapsedTimeMs.toFixed(2) + 'ms');
}

export function getReporter(options: Options): CSpellReporter {
    const issueTemplate = options.wordsOnly
        ? templateIssueWordsOnly
        : options.legacy
        ? templateIssueLegacy
        : options.showContext
        ? options.showSuggestions
            ? templateIssueWithContextWithSuggestions
            : templateIssueWithContext
        : options.showSuggestions
        ? templateIssueWithSuggestions
        : templateIssue;
    const { files, silent, summary, issues, progress, verbose, debug } = options;

    const emitters: InfoEmitter = {
        Debug: !silent && debug ? (s) => console.info(chalk.cyan(s)) : nullEmitter,
        Info: !silent && verbose ? (s) => console.info(chalk.yellow(s)) : nullEmitter,
        Warning: (s) => console.info(chalk.yellow(s)),
    };

    function infoEmitter(message: string, msgType: MessageType): void {
        emitters[msgType]?.(message);
    }

    const root = URI.file(options.root || process.cwd());
    const fsPathRoot = root.fsPath;
    function relativeIssue(fn: (i: Issue) => void): (i: Issue) => void {
        if (!options.relative) return fn;
        return (i: Issue) => {
            const r = { ...i };
            r.uri = r.uri ? relativeUriFilename(r.uri, fsPathRoot) : r.uri;
            fn(r);
        };
    }

    const resultEmitter = (result: RunResult) => {
        if (!files.length && !result.files) {
            return;
        }
        console.error(
            'CSpell: Files checked: %d, Issues found: %d in %d files',
            result.files,
            result.issues,
            result.filesWithIssues.size
        );
    };

    return {
        issue: relativeIssue(silent || !issues ? nullEmitter : genIssueEmitter(issueTemplate)),
        error: silent ? nullEmitter : errorEmitter,
        info: infoEmitter,
        debug: emitters.Debug,
        progress: !silent && progress ? reportProgress : nullEmitter,
        result: !silent && summary ? resultEmitter : nullEmitter,
    };
}

function formatIssue(templateStr: string, issue: Issue, maxIssueTextWidth: number) {
    function clean(t: string) {
        return t.replace(/\s+/, ' ');
    }
    const { uri = '', row, col, text, context, offset } = issue;
    const contextLeft = clean(context.text.slice(0, offset - context.offset));
    const contextRight = clean(context.text.slice(offset + text.length - context.offset));
    const contextFull = clean(context.text);
    const padContext = ' '.repeat(Math.max(maxIssueTextWidth - text.length, 0));
    const rowText = row.toString();
    const colText = col.toString();
    const padRowCol = ' '.repeat(Math.max(1, 8 - (rowText.length + colText.length)));
    const suggestions = issue.suggestions?.join(', ') || '';
    const message = issue.isFlagged ? '{yellow Forbidden word}' : 'Unknown word';
    const t = template(templateStr.replace(/\$message/g, message));
    return chalk(t)
        .replace(/\$\{col\}/g, colText)
        .replace(/\$\{row\}/g, rowText)
        .replace(/\$\{text\}/g, text)
        .replace(/\$\{uri\}/g, uri)
        .replace(/\$col/g, colText)
        .replace(/\$contextFull/g, contextFull)
        .replace(/\$contextLeft/g, contextLeft)
        .replace(/\$contextRight/g, contextRight)
        .replace(/\$padContext/g, padContext)
        .replace(/\$padRowCol/g, padRowCol)
        .replace(/\$row/g, rowText)
        .replace(/\$suggestions/g, suggestions)
        .replace(/\$text/g, text)
        .replace(/\$uri/g, uri);
}

class TS extends Array<string> {
    raw: string[];
    constructor(s: string) {
        super(s);
        this.raw = [s];
    }
}

function template(s: string): TemplateStringsArray {
    return new TS(s);
}
