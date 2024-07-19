import assert from 'node:assert';
import { format } from 'node:util';

import type {
    Issue,
    MessageType,
    ProgressFileBase,
    ProgressFileBegin,
    ProgressFileComplete,
    ProgressItem,
    RunResult,
} from '@cspell/cspell-types';
import { toFileDirURL, toFilePathOrHref, toFileURL, urlRelative } from '@cspell/url';
import type { ChalkInstance } from 'chalk';
import { Chalk } from 'chalk';
import { makeTemplate } from 'chalk-template';
import type { ImportError, SpellCheckFilePerf, SpellingDictionaryLoadError } from 'cspell-lib';
import { isSpellingDictionaryLoadError } from 'cspell-lib';

import type { Channel } from './console.js';
import { console as customConsole } from './console.js';
import { CSpellReporterConfiguration } from './models.js';
import type { LinterCliOptions } from './options.js';
import type { FinalizedReporter } from './util/reporters.js';
import { uniqueFilterFnGenerator } from './util/util.js';

const templateIssue = `{green $filename}:{yellow $row:$col} - $message ({red $text}) $quickFix`;
const templateIssueNoFix = `{green $filename}:{yellow $row:$col} - $message ({red $text})`;
const templateIssueWithSuggestions = `{green $filename}:{yellow $row:$col} - $message ({red $text}) Suggestions: {yellow [$suggestions]}`;
const templateIssueWithContext = `{green $filename}:{yellow $row:$col} $padRowCol- $message ({red $text})$padContext -- {gray $contextLeft}{red {underline $text}}{gray $contextRight}`;
const templateIssueWithContextWithSuggestions = `{green $filename}:{yellow $row:$col} $padRowCol- $message ({red $text})$padContext -- {gray $contextLeft}{red {underline $text}}{gray $contextRight}\n\t Suggestions: {yellow [$suggestions]}`;
const templateIssueLegacy = `{green $filename}[$row, $col]: $message: {red $text}`;
const templateIssueWordsOnly = '$text';

const console = undefined;

assert(!console);

export // Exported for testing.
interface ReporterIssue extends Issue {
    filename: string;
}

interface IOChalk {
    readonly chalk: ChalkInstance;
}

interface IO extends Channel, IOChalk {}

/**
 *
 * @param template - The template to use for the issue.
 * @param uniqueIssues - If true, only unique issues will be reported.
 * @param reportedIssuesCollection - optional collection to store reported issues.
 * @returns issueEmitter function
 */
function genIssueEmitter(
    io: IO,
    template: string,
    uniqueIssues: boolean,
    reportedIssuesCollection: string[] | undefined,
) {
    const uniqueFilter = uniqueIssues ? uniqueFilterFnGenerator((issue: Issue) => issue.text) : () => true;
    const defaultWidth = 10;
    let maxWidth = defaultWidth;
    let uri: string | undefined;

    return function issueEmitter(issue: ReporterIssue) {
        if (!uniqueFilter(issue)) return;
        if (uri !== issue.uri) {
            maxWidth = defaultWidth;
            uri = issue.uri;
        }
        maxWidth = Math.max(maxWidth * 0.999, issue.text.length, 10);
        const issueText = formatIssue(io, template, issue, Math.ceil(maxWidth));
        reportedIssuesCollection?.push(issueText);
        io.writeLine(issueText);
    };
}

type InfoEmitter = Record<MessageType, (msg: string) => void>;

function nullEmitter() {
    /* empty */
}

function relativeUriFilename(uri: string, rootURL: URL): string {
    const url = toFileURL(uri);
    const rel = urlRelative(rootURL, url);
    if (rel.startsWith('..')) return toFilePathOrHref(url);
    return rel;
}

function reportProgress(io: IO, p: ProgressItem, cwdURL: URL, options: CSpellReporterConfiguration) {
    if (p.type === 'ProgressFileComplete') {
        return reportProgressFileComplete(io, p, cwdURL, options);
    }
    if (p.type === 'ProgressFileBegin') {
        return reportProgressFileBegin(io, p, cwdURL);
    }
}

function determineFilename(io: IO, p: ProgressFileBase, cwd: URL) {
    const fc = '' + p.fileCount;
    const fn = (' '.repeat(fc.length) + p.fileNum).slice(-fc.length);
    const idx = fn + '/' + fc;
    const filename = io.chalk.gray(relativeUriFilename(p.filename, cwd));

    return { idx, filename };
}

function reportProgressFileBegin(io: IO, p: ProgressFileBegin, cwdURL: URL) {
    const { idx, filename } = determineFilename(io, p, cwdURL);
    if (io.getColorLevel() > 0) {
        io.clearLine?.(0);
        io.write(`${idx} ${filename}\r`);
    }
}

function reportProgressFileComplete(io: IO, p: ProgressFileComplete, cwd: URL, options: CSpellReporterConfiguration) {
    const { idx, filename } = determineFilename(io, p, cwd);
    const { verbose, debug } = options;
    const time = reportTime(io, p.elapsedTimeMs, !!p.cached);
    const skipped = p.processed === false ? ' skipped' : '';
    const hasErrors = p.numErrors ? io.chalk.red` X` : '';
    const newLine =
        (skipped && (verbose || debug)) || hasErrors || isSlow(p.elapsedTimeMs) || io.getColorLevel() < 1 ? '\n' : '';
    const msg = `${idx} ${filename} ${time}${skipped}${hasErrors}${newLine || '\r'}`;
    io.write(msg);
}

function reportTime(io: IO, elapsedTimeMs: number | undefined, cached: boolean): string {
    if (cached) return io.chalk.green('cached');
    if (elapsedTimeMs === undefined) return '-';
    const slow = isSlow(elapsedTimeMs);
    const color = !slow ? io.chalk.white : slow === 1 ? io.chalk.yellow : io.chalk.redBright;
    return color(elapsedTimeMs.toFixed(2) + 'ms');
}

function isSlow(elapsedTmeMs: number | undefined): number | undefined {
    if (!elapsedTmeMs || elapsedTmeMs < 1000) return 0;
    if (elapsedTmeMs < 2000) return 1;
    return 2;
}

export interface ReporterOptions
    extends Pick<
        LinterCliOptions,
        | 'debug'
        | 'issues'
        | 'issuesSummaryReport'
        | 'legacy'
        | 'progress'
        | 'relative'
        | 'root'
        | 'showContext'
        | 'showPerfSummary'
        | 'showSuggestions'
        | 'silent'
        | 'summary'
        | 'verbose'
        | 'wordsOnly'
    > {
    fileGlobs: string[];
}

interface ProgressFileCompleteWithPerf extends ProgressFileComplete {
    perf?: SpellCheckFilePerf;
}

export function getReporter(options: ReporterOptions, config?: CSpellReporterConfiguration): FinalizedReporter {
    const perfStats = {
        filesProcessed: 0,
        filesSkipped: 0,
        filesCached: 0,
        elapsedTimeMs: 0,
        perf: Object.create(null) as SpellCheckFilePerf,
    };
    const uniqueIssues = config?.unique || false;
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
              : options.showSuggestions === false
                ? templateIssueNoFix
                : templateIssue;
    const { fileGlobs, silent, summary, issues, progress: showProgress, verbose, debug } = options;

    const console = config?.console || customConsole;

    const stdio: IO = {
        ...console.stdoutChannel,
        chalk: new Chalk({ level: console.stdoutChannel.getColorLevel() }),
    };
    const stderr: IO = {
        ...console.stderrChannel,
        chalk: new Chalk({ level: console.stderrChannel.getColorLevel() }),
    };

    const consoleError = (msg: string) => stderr.writeLine(msg);

    function createInfoLog(wrap: (s: string) => string): (msg: string) => void {
        return (msg: string) => console.info(wrap(msg));
    }

    const emitters: InfoEmitter = {
        Debug: !silent && debug ? createInfoLog(stdio.chalk.cyan) : nullEmitter,
        Info: !silent && verbose ? createInfoLog(stdio.chalk.yellow) : nullEmitter,
        Warning: createInfoLog(stdio.chalk.yellow),
    };

    function infoEmitter(message: string, msgType: MessageType): void {
        emitters[msgType]?.(message);
    }

    const rootURL = toFileDirURL(options.root || process.cwd());
    function relativeIssue(fn: (i: ReporterIssue) => void): (i: Issue) => void {
        const fnFilename = options.relative
            ? (uri: string) => relativeUriFilename(uri, rootURL)
            : (uri: string) => toFilePathOrHref(toFileURL(uri, rootURL));
        return (i: Issue) => {
            const fullFilename = i.uri ? toFilePathOrHref(toFileURL(i.uri, rootURL)) : '';
            const filename = i.uri ? fnFilename(i.uri) : '';
            const r = { ...i, filename, fullFilename };
            fn(r);
        };
    }

    const issuesCollection: string[] | undefined = showProgress ? [] : undefined;
    const errorCollection: string[] | undefined = [];

    function errorEmitter(message: string, error: Error | SpellingDictionaryLoadError | ImportError) {
        if (isSpellingDictionaryLoadError(error)) {
            error = error.cause;
        }
        const errorText = format(stderr.chalk.red(message), error.toString());
        errorCollection?.push(errorText);
        consoleError(errorText);
    }

    const resultEmitter = (result: RunResult) => {
        if (!fileGlobs.length && !result.files) {
            return;
        }
        const { files, issues, cachedFiles, filesWithIssues, errors } = result;
        const numFilesWithIssues = filesWithIssues.size;

        if (stderr.getColorLevel() > 0) {
            stderr.write('\r');
            stderr.clearLine(0);
        }

        if (issuesCollection?.length || errorCollection?.length) {
            consoleError('-------------------------------------------');
        }

        if (issuesCollection?.length) {
            consoleError('Issues found:');
            issuesCollection.forEach((issue) => consoleError(issue));
        }

        const cachedFilesText = cachedFiles ? ` (${cachedFiles} from cache)` : '';
        const withErrorsText = errors ? ` with ${errors} error${errors === 1 ? '' : 's'}` : '';
        const numFilesWidthIssuesText = numFilesWithIssues === 1 ? '1 file' : `${numFilesWithIssues} files`;

        const summaryMessage = `CSpell\u003A Files checked: ${files}${cachedFilesText}, Issues found: ${issues} in ${numFilesWidthIssuesText}${withErrorsText}.`;

        consoleError(summaryMessage);

        if (errorCollection?.length && issues > 5) {
            consoleError('-------------------------------------------');
            consoleError('Errors:');
            errorCollection.forEach((error) => consoleError(error));
        }

        if (options.showPerfSummary) {
            consoleError('-------------------------------------------');
            consoleError('Performance Summary:');
            consoleError(`  Files Processed: ${perfStats.filesProcessed.toString().padStart(6)}`);
            consoleError(`  Files Skipped  : ${perfStats.filesSkipped.toString().padStart(6)}`);
            consoleError(`  Files Cached   : ${perfStats.filesCached.toString().padStart(6)}`);
            consoleError(`  Processing Time: ${perfStats.elapsedTimeMs.toFixed(2).padStart(9)}ms`);
            consoleError('Stats:');
            const stats = Object.entries(perfStats.perf)
                .filter((p): p is [string, number] => !!p[1])
                .map(([key, value]) => [key, value.toFixed(2)] as const);
            const padName = Math.max(...stats.map((s) => s[0].length));
            const padValue = Math.max(...stats.map((s) => s[1].length));
            stats.sort((a, b) => a[0].localeCompare(b[0]));
            for (const [key, value] of stats) {
                value && consoleError(`  ${key.padEnd(padName)}: ${value.padStart(padValue)}ms`);
            }
        }
    };

    function collectPerfStats(p: ProgressFileCompleteWithPerf) {
        if (p.cached) {
            perfStats.filesCached++;
            return;
        }
        perfStats.filesProcessed += p.processed ? 1 : 0;
        perfStats.filesSkipped += !p.processed ? 1 : 0;
        perfStats.elapsedTimeMs += p.elapsedTimeMs || 0;

        if (!p.perf) return;
        for (const [key, value] of Object.entries(p.perf)) {
            if (typeof value === 'number') {
                perfStats.perf[key] = (perfStats.perf[key] || 0) + value;
            }
        }
    }

    function progress(p: ProgressItem) {
        if (!silent && showProgress) {
            reportProgress(stderr, p, rootURL, options);
        }
        if (p.type === 'ProgressFileComplete') {
            collectPerfStats(p);
        }
    }

    return {
        issue: relativeIssue(
            silent || !issues ? nullEmitter : genIssueEmitter(stdio, issueTemplate, uniqueIssues, issuesCollection),
        ),
        error: silent ? nullEmitter : errorEmitter,
        info: infoEmitter,
        debug: emitters.Debug,
        progress,
        result: !silent && summary ? resultEmitter : nullEmitter,
    };
}

function formatIssue(io: IOChalk, templateStr: string, issue: ReporterIssue, maxIssueTextWidth: number): string {
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
    const suggestions = formatSuggestions(io, issue);
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
        $quickFix: formatQuickFix(io, issue),
    };

    const t = templateStr.replaceAll('$message', message);
    const chalkTemplate = makeTemplate(io.chalk);
    return substitute(chalkTemplate(t), substitutions).trimEnd();
}

function formatSuggestions(io: IOChalk, issue: Issue): string {
    if (issue.suggestionsEx) {
        return issue.suggestionsEx
            .map((sug) =>
                sug.isPreferred
                    ? io.chalk.italic(io.chalk.bold(sug.wordAdjustedToMatchCase || sug.word)) + '*'
                    : sug.wordAdjustedToMatchCase || sug.word,
            )
            .join(', ');
    }
    if (issue.suggestions) {
        return issue.suggestions.join(', ');
    }
    return '';
}

function formatQuickFix(io: IOChalk, issue: Issue): string {
    if (!issue.suggestionsEx?.length) return '';
    const preferred = issue.suggestionsEx
        .filter((sug) => sug.isPreferred)
        .map((sug) => sug.wordAdjustedToMatchCase || sug.word);
    if (!preferred.length) return '';
    const fixes = preferred.map((w) => io.chalk.italic(io.chalk.yellow(w)));
    return `fix: (${fixes.join(', ')})`;
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
