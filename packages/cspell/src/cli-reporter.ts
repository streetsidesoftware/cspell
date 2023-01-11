import type {
    CSpellReporter,
    Issue,
    MessageType,
    ProgressFileBegin,
    ProgressFileComplete,
    ProgressItem,
    RunResult,
} from '@cspell/cspell-types';
import chalk from 'chalk';
import type { ImportError, SpellingDictionaryLoadError } from 'cspell-lib';
import { isSpellingDictionaryLoadError } from 'cspell-lib';
import * as path from 'path';
import { URI } from 'vscode-uri';

import type { LinterCliOptions } from './options';

const templateIssue = `{green $filename}:{yellow $row:$col} - $message ({red $text})`;
const templateIssueWithSuggestions = `{green $filename}:{yellow $row:$col} - $message ({red $text}) Suggestions: {yellow [$suggestions]}`;
const templateIssueWithContext = `{green $filename}:{yellow $row:$col} $padRowCol- $message ({red $text})$padContext -- {gray $contextLeft}{red {underline $text}}{gray $contextRight}`;
const templateIssueWithContextWithSuggestions = `{green $filename}:{yellow $row:$col} $padRowCol- $message ({red $text})$padContext -- {gray $contextLeft}{red {underline $text}}{gray $contextRight}\n\t Suggestions: {yellow [$suggestions]}`;
const templateIssueLegacy = `${chalk.green('$filename')}[$row, $col]: $message: ${chalk.red('$text')}`;
const templateIssueWordsOnly = '$text';

export // Exported for testing.
interface ReporterIssue extends Issue {
    filename: string;
}

function genIssueEmitter(template: string) {
    const defaultWidth = 10;
    let maxWidth = defaultWidth;
    let uri: string | undefined;

    return function issueEmitter(issue: ReporterIssue) {
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
    if (p.type === 'ProgressFileComplete') {
        return reportProgressFileComplete(p);
    }
    if (p.type === 'ProgressFileBegin') {
        return reportProgressFileBegin(p);
    }
}

function reportProgressFileBegin(p: ProgressFileBegin) {
    const fc = '' + p.fileCount;
    const fn = (' '.repeat(fc.length) + p.fileNum).slice(-fc.length);
    const idx = fn + '/' + fc;
    const filename = chalk.gray(relativeFilename(p.filename));
    process.stderr.write(`\r${idx} ${filename}`);
}

function reportProgressFileComplete(p: ProgressFileComplete) {
    const time = reportTime(p.elapsedTimeMs, !!p.cached);
    const skipped = p.processed === false ? ' skipped' : '';
    const hasErrors = p.numErrors ? chalk.red` X` : '';
    console.error(` ${time}${skipped}${hasErrors}`);
}

function reportTime(elapsedTimeMs: number | undefined, cached: boolean): string {
    if (cached) return chalk.green('cached');
    if (elapsedTimeMs === undefined) return '-';
    const color = elapsedTimeMs < 1000 ? chalk.white : elapsedTimeMs < 2000 ? chalk.yellow : chalk.redBright;
    return color(elapsedTimeMs.toFixed(2) + 'ms');
}

export interface ReporterOptions
    extends Pick<
        LinterCliOptions,
        | 'debug'
        | 'issues'
        | 'legacy'
        | 'progress'
        | 'relative'
        | 'root'
        | 'showContext'
        | 'showSuggestions'
        | 'silent'
        | 'summary'
        | 'verbose'
        | 'wordsOnly'
    > {
    fileGlobs: string[];
}

export function getReporter(options: ReporterOptions): CSpellReporter {
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
    const { fileGlobs, silent, summary, issues, progress, verbose, debug } = options;

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
    function relativeIssue(fn: (i: ReporterIssue) => void): (i: Issue) => void {
        const fnFilename = options.relative
            ? (uri: string) => relativeUriFilename(uri, fsPathRoot)
            : (uri: string) => URI.parse(uri).fsPath;
        return (i: Issue) => {
            const filename = i.uri ? fnFilename(i.uri) : '';
            const r = { ...i, filename };
            fn(r);
        };
    }

    const resultEmitter = (result: RunResult) => {
        if (!fileGlobs.length && !result.files) {
            return;
        }
        if (result.cachedFiles) {
            console.error(
                'CSpell: Files checked: %d (%d from cache), Issues found: %d in %d files',
                result.files,
                result.cachedFiles,
                result.issues,
                result.filesWithIssues.size
            );
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

function formatIssue(templateStr: string, issue: ReporterIssue, maxIssueTextWidth: number): string {
    function clean(t: string) {
        return t.replace(/\s+/, ' ');
    }
    const { uri = '', filename, row, col, text, context, offset } = issue;
    const contextLeft = clean(context.text.slice(0, offset - context.offset));
    const contextRight = clean(context.text.slice(offset + text.length - context.offset));
    const contextFull = clean(context.text);
    const padContext = ' '.repeat(Math.max(maxIssueTextWidth - text.length, 0));
    const rowText = row.toString();
    const colText = col.toString();
    const padRowCol = ' '.repeat(Math.max(1, 8 - (rowText.length + colText.length)));
    const suggestions = formatSuggestions(issue);
    const msg = issue.message || (issue.isFlagged ? 'Forbidden word' : 'Unknown word');
    const message = issue.isFlagged ? `{yellow ${msg}}` : msg;

    const substitutions = {
        $col: colText,
        $contextFull: contextFull,
        $contextLeft: contextLeft,
        $contextRight: contextRight,
        $filename: filename,
        $padContext: padContext,
        $padRowCol: padRowCol,
        $row: rowText,
        $suggestions: suggestions,
        $text: text,
        $uri: uri,
    };

    const t = template(templateStr.replace(/\$message/g, message));

    return substitute(chalk(t), substitutions);
}

function formatSuggestions(issue: Issue): string {
    if (issue.suggestionsEx) {
        return issue.suggestionsEx
            .map((sug) => (sug.isPreferred ? chalk.italic(chalk.bold(sug.word)) + '*' : sug.word))
            .join(', ');
    }
    if (issue.suggestions) {
        return issue.suggestions.join(', ');
    }
    return '';
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

function substitute(text: string, substitutions: Record<string, string>): string {
    type SubRange = [number, number, string];
    const subs: SubRange[] = [];

    for (const [match, replaceWith] of Object.entries(substitutions)) {
        const len = match.length;
        for (let i = text.indexOf(match); i >= 0; i = text.indexOf(match, i + 1)) {
            subs.push([i, i + len, replaceWith]);
        }
    }

    subs.sort((a, b) => a[0] - b[0]);

    let i = 0;
    function sub(r: SubRange): string {
        const [a, b, t] = r;
        const prefix = text.slice(i, a);
        i = b;
        return prefix + t;
    }

    const parts = subs.map(sub);
    return parts.join('') + text.slice(i);
}

export const __testing__ = {
    formatIssue,
};
