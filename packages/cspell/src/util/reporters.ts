import assert from 'node:assert';

import {
    type CSpellReporter,
    type CSpellReporterModule,
    type CSpellSettings,
    type FeaturesSupportedByReporter,
    type FileSettings,
    type Issue,
    IssueType,
    type ProgressFileComplete,
    type ReporterConfiguration,
    type ReporterSettings,
    type ReportIssueOptions,
    type RunResult,
    unknownWordsChoices,
} from '@cspell/cspell-types';
import { dynamicImport } from '@cspell/dynamic-import';

import { pkgDir } from '../pkgInfo.js';
import { ApplicationError, toError } from './errors.js';
import type { LintFileResult } from './LintFileResult.js';
import { clean } from './util.js';

export type FinalizedReporter = Required<CSpellReporter>;

function filterFeatureIssues(
    features: FeaturesSupportedByReporter | undefined,
    issue: Issue,
    reportOptions?: ReportIssueOptions,
): boolean {
    if (issue.issueType === IssueType.directive) {
        return (features?.issueType && reportOptions?.validateDirectives) || false;
    }
    if (features?.unknownWords) {
        return true;
    }
    if (!reportOptions) {
        // If no options are provided, report the issue.
        return true;
    }
    // The reporter doesn't support the `unknownWords` feature. Handle the logic here.
    if (
        issue.isFlagged ||
        !reportOptions.unknownWords ||
        reportOptions.unknownWords === unknownWordsChoices.ReportAll
    ) {
        return true;
    }
    if (issue.hasPreferredSuggestions && reportOptions.unknownWords !== unknownWordsChoices.ReportFlagged) {
        return true;
    }
    if (issue.hasSimpleSuggestions && reportOptions.unknownWords === unknownWordsChoices.ReportSimple) {
        return true;
    }
    return false;
}

function handleIssue(reporter: CSpellReporter, issue: Issue, reportOptions?: ReportIssueOptions | undefined): void {
    if (!reporter.issue) return;
    if (!filterFeatureIssues(reporter.features, issue, reportOptions)) {
        // The reporter does not want to handle this issue.
        return;
    }
    if (!reporter.features?.contextGeneration && !issue.context) {
        issue = { ...issue };
        issue.context = issue.line; // Ensure context is always set if the reporter does not support context generation.
    }
    return reporter.issue(issue, reportOptions);
}

/**
 * Loads reporter modules configured in cspell config file
 */
export async function loadReporters(
    reporters: FileSettings['reporters'],
    defaultReporter: CSpellReporter,
    config: ReporterConfiguration,
): Promise<ReadonlyArray<CSpellReporter>> {
    async function loadReporter(reporterSettings: ReporterSettings): Promise<CSpellReporter | undefined> {
        if (reporterSettings === 'default') return defaultReporter;
        if (!Array.isArray(reporterSettings)) {
            reporterSettings = [reporterSettings];
        }
        const [moduleName, settings] = reporterSettings;

        try {
            const { getReporter }: CSpellReporterModule = await dynamicImport(moduleName, [process.cwd(), pkgDir]);
            return getReporter(settings, config);
        } catch (e: unknown) {
            throw new ApplicationError(`Failed to load reporter ${moduleName}: ${toError(e).message}`);
        }
    }

    reporters = !reporters || !reporters.length ? ['default'] : [...reporters];

    const loadedReporters = await Promise.all(reporters.map(loadReporter));
    return loadedReporters.filter((v: CSpellReporter | undefined): v is CSpellReporter => v !== undefined);
}

export function finalizeReporter(reporter: undefined): undefined;
export function finalizeReporter(reporter: CSpellReporter): FinalizedReporter;
export function finalizeReporter(reporter: CSpellReporter | undefined): FinalizedReporter | undefined;
export function finalizeReporter(reporter: CSpellReporter | undefined): FinalizedReporter | undefined {
    if (!reporter) return undefined;

    if (reporterIsFinalized(reporter)) {
        return reporter;
    }

    const final: FinalizedReporter = {
        issue: (...params) => reporter.issue?.(...params),
        info: (...params) => reporter.info?.(...params),
        debug: (...params) => reporter.debug?.(...params),
        progress: (...params) => reporter.progress?.(...params),
        error: (...params) => reporter.error?.(...params),
        result: (...params) => reporter.result?.(...params),
        features: reporter.features,
    };

    return final;
}

function reporterIsFinalized(reporter: CSpellReporter | FinalizedReporter | undefined): reporter is FinalizedReporter {
    return (
        (!!reporter &&
            reporter.features &&
            typeof reporter.issue === 'function' &&
            typeof reporter.info === 'function' &&
            typeof reporter.debug === 'function' &&
            typeof reporter.error === 'function' &&
            typeof reporter.progress === 'function' &&
            typeof reporter.result === 'function') ||
        false
    );
}

type ReportIssueOptionsKeyMap = Required<{ [K in keyof ReportIssueOptions]: K }>;

const reportIssueOptionsKeyMap: ReportIssueOptionsKeyMap = {
    unknownWords: 'unknownWords',
    validateDirectives: 'validateDirectives',
    showContext: 'showContext',
};

function setValue<K extends keyof ReportIssueOptions>(
    options: ReportIssueOptions,
    key: K,
    value: ReportIssueOptions[K] | undefined,
) {
    if (value !== undefined) {
        options[key] = value;
    }
}

export function extractReporterIssueOptions(settings: CSpellSettings | ReportIssueOptions): ReportIssueOptions {
    const src: ReportIssueOptions = settings as ReportIssueOptions;
    const options: ReportIssueOptions = {} as ReportIssueOptions;
    for (const key in reportIssueOptionsKeyMap) {
        const k = key as keyof ReportIssueOptionsKeyMap;
        setValue(options, k, src[k]);
    }
    return options;
}

export function mergeReportIssueOptions(
    a: ReportIssueOptions | CSpellSettings,
    b: ReportIssueOptions | undefined,
): ReportIssueOptions {
    const options: ReportIssueOptions = extractReporterIssueOptions(a);
    if (!b) return options;
    for (const key in reportIssueOptionsKeyMap) {
        const k = key as keyof ReportIssueOptions;
        setValue(options, k, b[k]);
    }
    return options;
}

export class LintReporter {
    #reporters: FinalizedReporter[] = [];
    #config: ReporterConfiguration;
    #finalized: boolean = false;

    constructor(
        readonly defaultReporter: CSpellReporter,
        config: ReporterConfiguration,
    ) {
        this.#config = config;
        if (defaultReporter) {
            this.#reporters.push(finalizeReporter(defaultReporter));
        }
    }

    get config(): ReporterConfiguration {
        return this.#config;
    }

    set config(config: ReporterConfiguration) {
        assert(!this.#finalized, 'Cannot change the configuration of a finalized reporter');
        this.#config = config;
    }

    issue(issue: Issue, reportOptions?: ReportIssueOptions): void {
        for (const reporter of this.#reporters) {
            handleIssue(reporter, issue, reportOptions);
        }
    }

    info(...params: Parameters<FinalizedReporter['info']>): void {
        for (const reporter of this.#reporters) {
            reporter.info(...params);
        }
    }

    debug(...params: Parameters<FinalizedReporter['debug']>): void {
        for (const reporter of this.#reporters) {
            reporter.debug(...params);
        }
    }

    error(...params: Parameters<FinalizedReporter['error']>): void {
        for (const reporter of this.#reporters) {
            reporter.error(...params);
        }
    }

    progress(...params: Parameters<FinalizedReporter['progress']>): void {
        for (const reporter of this.#reporters) {
            reporter.progress(...params);
        }
    }

    async result(result: RunResult): Promise<void> {
        await Promise.all(this.#reporters.map((reporter) => reporter.result?.(result)));
    }

    get features(): FeaturesSupportedByReporter {
        return {
            unknownWords: true,
            issueType: true,
        };
    }

    async loadReportersAndFinalize(reporters: FileSettings['reporters']): Promise<void> {
        assert(!this.#finalized, 'Cannot change the configuration of a finalized reporter');
        const loaded = await loadReporters(reporters, this.defaultReporter, this.config);
        this.#reporters = [...new Set(loaded)].map((reporter) => finalizeReporter(reporter));
    }

    emitProgressBegin(filename: string, fileNum: number, fileCount: number): void {
        this.progress({
            type: 'ProgressFileBegin',
            fileNum,
            fileCount,
            filename,
        });
    }

    emitProgressComplete(filename: string, fileNum: number, fileCount: number, result: LintFileResult): number {
        const filteredIssues = result.issues.filter((issue) =>
            filterFeatureIssues({}, issue, result.reportIssueOptions),
        );
        const numIssues = filteredIssues.length;

        for (const reporter of this.#reporters) {
            const progress: ProgressFileComplete = clean({
                type: 'ProgressFileComplete',
                fileNum,
                fileCount,
                filename,
                elapsedTimeMs: result.elapsedTimeMs,
                processed: result.processed,
                skippedReason: result.skippedReason,
                numErrors: numIssues || result.errors,
                cached: result.cached,
                perf: result.perf,
                issues: reporter.features && result.issues,
                reportIssueOptions: reporter.features && result.reportIssueOptions,
            });
            reporter.progress(progress);
        }

        // Show the spelling errors after emitting the progress.
        result.issues.forEach((issue) => this.issue(issue, result.reportIssueOptions));

        return numIssues;
    }
}
