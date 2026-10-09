import assert from 'node:assert';
import { formatWithOptions } from 'node:util';

import { getCounters } from '@cspell/cspell-performance-monitor';
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
import type { ImportError, SpellCheckFilePerf, SpellingDictionaryLoadError } from 'cspell-lib';
import { isSpellingDictionaryLoadError } from 'cspell-lib';

import type { Channel } from './console.js';
import { console as customConsole } from './console.js';
import type { IOChalk, ReporterIssue } from './formatIssue.js';
import { checkTemplate, formatIssue } from './formatIssue.js';
import type { CSpellReporterConfiguration } from './models.js';
import type { LinterCliOptions } from './options.js';
import type { FinalizedReporter } from './reporters/index.js';
import type { PerfMeasurement } from './util/perfMeasurements.js';
import { getPerfMeasurements } from './util/perfMeasurements.js';
import type { Table, TableRow } from './util/table.js';
import { tableToLines } from './util/table.js';
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

interface IO extends Channel, IOChalk {}

/**
 *
 * @param template - The template to use for the issue.
 * @param uniqueIssues - If true, only unique issues will be reported.
 * @param reportedIssuesCollection - optional collection to store reported issues.
 * @returns issueEmitter function
 */
function genIssueEmitter(
    stdIO: IO,
    errIO: IO,
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
        const issueText = formatIssue(stdIO, template, issue, Math.ceil(maxWidth));
        reportedIssuesCollection?.push(formatIssue(errIO, template, issue, Math.ceil(maxWidth)));
        stdIO.writeLine(issueText);
    };
}

type InfoEmitter = Record<MessageType, (msg: string) => void>;

function nullEmitter() {
    /* empty */
}

function relativeUriFilename(uri: string, rootURL: URL): string {
    const url = toFileURL(uri);
    const rel = urlRelative(rootURL, url);
    return rel.startsWith('..') ? toFilePathOrHref(url) : rel;
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
    const skippedReason = p.skippedReason ? ` (${p.skippedReason})` : '';
    const skipped = p.processed === false ? ` skipped${skippedReason}` : '';
    const hasErrors = p.numErrors ? io.chalk.red` X` : '';
    const newLine = verbose || debug || hasErrors || isSlow(p.elapsedTimeMs) || io.getColorLevel() < 1 ? '\n' : '';
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
    return elapsedTmeMs < 2000 ? 1 : 2;
}

export interface ReporterOptions extends Pick<
    LinterCliOptions,
    | 'color'
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
    | 'verboseLevel'
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
        accumulatedTimeMs: 0,
        startTime: performance.now(),
        firstFileStartTime: 0,
        lastFileEndTime: 0,
        betweenFilesTimeMs: 0,
        perf: Object.create(null) as SpellCheckFilePerf,
    };
    const noColor = options.color === false;
    const forceColor = options.color === true;
    const uniqueIssues = config?.unique || false;
    const defaultIssueTemplate = options.wordsOnly
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

    const issueTemplate = config?.issueTemplate || defaultIssueTemplate;

    assertCheckTemplate(issueTemplate);

    const console = config?.console || customConsole;

    const colorLevel = noColor ? 0 : forceColor ? 2 : console.stdoutChannel.getColorLevel();

    const stdio: IO = {
        ...console.stdoutChannel,
        chalk: new Chalk({ level: colorLevel }),
    };
    const stderr: IO = {
        ...console.stderrChannel,
        chalk: new Chalk({ level: colorLevel }),
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

    /*
     * Turn off repeated issues see https://github.com/streetsidesoftware/cspell/pull/6058
     * We might want to add a CLI option later to turn this back on.
     */
    const repeatIssues = false;

    const issuesCollection: string[] | undefined = showProgress && repeatIssues ? [] : undefined;
    const errorCollection: string[] | undefined = [];

    function errorEmitter(message: string, error: Error | SpellingDictionaryLoadError | ImportError) {
        if (isSpellingDictionaryLoadError(error)) {
            error = error.cause;
        }
        const errorText = formatWithOptions(
            { colors: stderr.stream.hasColors?.() },
            stderr.chalk.red(message),
            debug ? error : error.toString(),
        );
        errorCollection?.push(errorText);
        consoleError(errorText);
    }

    const resultEmitter = (result: RunResult) => {
        const { files, issues, cachedFiles, filesWithIssues, errors, skippedFiles } = result;
        if (!fileGlobs.length && !files && !skippedFiles && !errors && !issues) {
            return;
        }
        const numFilesWithIssues = filesWithIssues.size;
        const chalk = stderr.chalk;

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

        const filesChecked = files - (skippedFiles || 0);
        const cachedFilesText = cachedFiles ? ` (${cachedFiles} from cache)` : '';
        const skippedFilesText = skippedFiles ? `, skipped: ${skippedFiles}` : '';
        const withErrorsText = errors ? ` with ${errors} error${errors === 1 ? '' : 's'}` : '';
        const numFilesWidthIssuesText = numFilesWithIssues === 1 ? '1 file' : `${numFilesWithIssues} files`;

        const summaryMessage = `CSpell\u003A Files checked: ${filesChecked}${cachedFilesText}${skippedFilesText}, Issues found: ${issues} in ${numFilesWidthIssuesText}${withErrorsText}.`;

        consoleError(summaryMessage);

        if (errorCollection?.length && issues > 5) {
            consoleError('-------------------------------------------');
            consoleError('Errors:');
            errorCollection.forEach((error) => consoleError(error));
        }

        if (options.showPerfSummary) {
            const now = performance.now();
            const elapsedTotal = now - perfStats.startTime;
            const setupTime = (perfStats.firstFileStartTime || now) - perfStats.startTime;
            const otherTime = elapsedTotal - setupTime - perfStats.accumulatedTimeMs - perfStats.betweenFilesTimeMs;

            consoleError('-------------------------------------------');
            consoleError('Performance Summary:');
            consoleError(`  Files Processed : ${perfStats.filesProcessed.toString().padStart(11)}`);
            consoleError(`  Files Skipped   : ${perfStats.filesSkipped.toString().padStart(11)}`);
            consoleError(`  Files Cached    : ${perfStats.filesCached.toString().padStart(11)}`);
            consoleError(`  Setup Time      : ${setupTime.toFixed(2).padStart(9)}ms`);
            consoleError(`  Processing Time : ${perfStats.accumulatedTimeMs.toFixed(2).padStart(9)}ms`);
            consoleError(`  Between Files   : ${perfStats.betweenFilesTimeMs.toFixed(2).padStart(9)}ms`);
            consoleError(`  Other Time      : ${otherTime.toFixed(2).padStart(9)}ms`);
            consoleError(`  Total Time      : ${elapsedTotal.toFixed(2).padStart(9)}ms`);

            const tableStats: Table = {
                title: chalk.bold('Perf Stats:'),
                header: ['Name', 'Time (ms)'],
                columnAlignments: ['L', 'R'],
                indent: 2,
                rows: Object.entries(perfStats.perf)
                    .filter((p): p is [string, number] => !!p[1])
                    .map(([key, value]) => [key, value.toFixed(2)] as const),
            };

            consoleError('');
            for (const line of tableToLines(tableStats)) {
                consoleError(line);
            }

            if (options.verboseLevel) {
                verbosePerfReport();
            }
        }
    };

    function verbosePerfReport() {
        const perfMeasurements = getPerfMeasurements();
        if (!perfMeasurements.length) return;
        dispVerbosePerfReport(perfMeasurements);
        counterReport();
    }

    function dispVerbosePerfReport(perfMeasurements: PerfMeasurement[]) {
        const notable = extractNotableBySelfTimeInGroup(perfMeasurements);

        const chalk = stderr.chalk;
        const maxDepth = Math.max(...perfMeasurements.map((m) => m.depth));
        const depthIndicator = (d: number) => '⋅'.repeat(d) + ' '.repeat(maxDepth - d);
        const rows: TableRow[] = perfMeasurements.map((m) => {
            const cbd = (text: string) => colorByDepth(chalk, m.depth, text);
            const cNotable = (text: string) => (notable.has(m) ? chalk.yellow(text) : text);
            return [
                chalk.dim('⋅'.repeat(m.depth)) + colorByDepthGrayscale(stderr.chalk, m.depth, m.name),
                cbd(m.totalTimeMs.toFixed(2) + chalk.dim(depthIndicator(m.depth))),
                cbd(cNotable((m.totalTimeMs - m.nestedTimeMs).toFixed(2))),
                cbd(m.count.toString()),
                cbd(m.minTimeMs.toFixed(2)),
                cbd(m.maxTimeMs.toFixed(2)),
                cbd((m.totalTimeMs / m.count).toFixed(2)),
            ];
        });
        const table = tableToLines({
            title: chalk.bold('Detailed Measurements:'),
            header: ['Name', 'Total Time (ms)', 'Self (ms)', 'Count', 'Min (ms)', 'Max (ms)', 'Avg (ms)'],
            rows,
            columnAlignments: ['L', 'R', 'R', 'R', 'R', 'R', 'R'],
            indent: 2,
        });

        consoleError('\n-------------------------------------------\n');
        for (const line of table) {
            consoleError(line);
        }
    }

    function counterReport() {
        const counters = [...getCounters()];
        if (!counters.length) return;

        counters.sort((a, b) => a.count - b.count);

        const chalk = stderr.chalk;
        const rows: TableRow[] = counters.map((m) => ({ Name: m.name, Count: m.count.toString() }));
        const table = tableToLines({
            title: chalk.bold('Counter Measurements:'),
            header: ['Name', 'Count'],
            rows,
            columnAlignments: ['L', 'R'],
            indent: 2,
        });

        consoleError('\n-------------------------------------------\n');
        for (const line of table) {
            consoleError(line);
        }
    }

    function colorByDepth(chalk: ChalkInstance, depth: number, text: string): string {
        const colors = [chalk.green, chalk.cyan, chalk.blue, chalk.magenta, chalk.red];
        const color = colors[depth % colors.length];
        return depth / colors.length >= 1 ? chalk.dim(color(text)) : color(text);
    }

    function colorByDepthGrayscale(chalk: ChalkInstance, depth: number, text: string): string {
        const grayLevel = Math.max(32, 255 - depth * 20);
        const color = chalk.rgb(grayLevel, grayLevel, grayLevel);
        return color(text);
    }

    function collectPerfStats(p: ProgressFileCompleteWithPerf) {
        if (p.cached) {
            perfStats.filesCached++;
            return;
        }
        perfStats.filesProcessed += p.processed ? 1 : 0;
        perfStats.filesSkipped += !p.processed ? 1 : 0;
        perfStats.accumulatedTimeMs += p.elapsedTimeMs || 0;

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
        if (p.type === 'ProgressFileBegin') {
            const now = performance.now();
            perfStats.firstFileStartTime ||= now;
            if (perfStats.lastFileEndTime) {
                perfStats.betweenFilesTimeMs += now - perfStats.lastFileEndTime;
            }
        }
        if (p.type === 'ProgressFileComplete') {
            perfStats.lastFileEndTime = performance.now();
            collectPerfStats(p);
        }
    }

    return {
        issue: relativeIssue(
            silent || !issues
                ? nullEmitter
                : genIssueEmitter(stdio, stderr, issueTemplate, uniqueIssues, issuesCollection),
        ),
        error: silent ? nullEmitter : errorEmitter,
        info: infoEmitter,
        debug: emitters.Debug,
        progress,
        result: !silent && summary ? resultEmitter : nullEmitter,
        features: { issueType: true },
    };
}

function extractNotableBySelfTimeInGroup(measurements: PerfMeasurement[]): Set<PerfMeasurement> {
    const notable = new Set<PerfMeasurement>();

    if (!measurements.length) return notable;

    let highest: PerfMeasurement | undefined;
    let highestSelfTime = 0;
    for (const m of measurements) {
        if (m.depth === 0 || !highest) {
            if (highest) notable.add(highest);
            highest = m;
            highestSelfTime = m.totalTimeMs - m.nestedTimeMs;
            continue;
        }
        const selfTime = m.totalTimeMs - m.nestedTimeMs;
        if (selfTime > highestSelfTime) {
            highest = m;
            highestSelfTime = selfTime;
        }
    }

    if (highest) notable.add(highest);

    return notable;
}

function assertCheckTemplate(template: string): void {
    const r = checkTemplate(template);
    if (r instanceof Error) {
        throw r;
    }
}
