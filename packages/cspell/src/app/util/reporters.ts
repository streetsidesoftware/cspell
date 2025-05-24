import {
    type CSpellReporter,
    type CSpellReporterEmitters,
    type CSpellReporterModule,
    type CSpellSettings,
    type FileSettings,
    type Issue,
    IssueType,
    type ReporterConfiguration,
    type ReporterSettings,
    type ReportIssueOptions,
    type RunResult,
    unknownWordsChoices,
} from '@cspell/cspell-types';
import { dynamicImport } from '@cspell/dynamic-import';

import { pkgDir } from '../pkgInfo.js';
import { ApplicationError, toError } from './errors.js';

type StandardEmitters = Omit<CSpellReporterEmitters, 'result'>;

function callAll<P0>(methods: ((p: P0) => void)[]): (p: P0) => void;
function callAll<P0, P1>(methods: ((p0: P0, p1: P1) => void)[]): (p0: P0, p1: P1) => void;
function callAll<P>(methods: ((...p: P[]) => void)[]): (...p: P[]) => void {
    return (...p: P[]) => {
        for (const method of methods) {
            method(...p);
        }
        return;
    };
}

export type FinalizedReporter = Required<CSpellReporter>;

function extractEmitter<K extends keyof StandardEmitters>(
    reporters: ReadonlyArray<StandardEmitters>,
    emitterName: K,
): FinalizedReporter[K][] {
    // The `bind` is used in case the reporter is a class.
    return reporters
        .map((r) => r[emitterName]?.bind(r) as StandardEmitters[K])
        .filter((r): r is FinalizedReporter[K] => !!r);
}

function mergeResultEmitters(reporters: ReadonlyArray<CSpellReporter>): FinalizedReporter['result'] {
    return async (result: RunResult) => {
        await Promise.all(reporters.map((reporter) => reporter.result?.(result)));
    };
}

function handleIssue(reporter: CSpellReporter, issue: Issue, reportOptions?: ReportIssueOptions | undefined) {
    if (!reporter.issue) return;
    if (issue.issueType === IssueType.directive) {
        if (!reporter.features?.issueType) return;
        reporter.issue(issue, reportOptions);
        return;
    }
    if (reporter.features?.unknownWords) {
        reporter.issue(issue, reportOptions);
        return;
    }
    if (!reportOptions) {
        // If no options are provided, report the issue.
        reporter.issue(issue);
        return;
    }
    // The reporter doesn't support the `unknownWords` feature. Handle the logic here.
    let reportIssue = issue.isFlagged;
    reportIssue ||= !reportOptions.unknownWords || reportOptions.unknownWords === unknownWordsChoices.ReportAll;
    reportIssue ||= reportOptions.unknownWords === unknownWordsChoices.ReportSimple && issue.hasSimpleSuggestions;
    reportIssue ||=
        reportOptions.unknownWords === unknownWordsChoices.ReportCommonTypos && issue.hasPreferredSuggestions;

    if (reportIssue) {
        reporter.issue(issue, reportOptions);
    }
}

/**
 * Mergers several cspell reporters into a single one
 */
export function mergeReporters(...reporters: ReadonlyArray<CSpellReporter>): FinalizedReporter {
    function issue(issue: Issue, reportOptions?: ReportIssueOptions | undefined) {
        for (const reporter of reporters) {
            handleIssue(reporter, issue, reportOptions);
        }
    }

    const reporter: FinalizedReporter = {
        issue,
        info: callAll(extractEmitter(reporters, 'info')),
        debug: callAll(extractEmitter(reporters, 'debug')),
        progress: callAll(extractEmitter(reporters, 'progress')),
        error: callAll(extractEmitter(reporters, 'error')),
        result: mergeResultEmitters(reporters),
        features: {
            unknownWords: true,
            issueType: true,
        },
    };

    return reporter;
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
    return reporter && mergeReporters(reporter);
}

type ReportIssueOptionsKeyMap = {
    [K in keyof ReportIssueOptions]: K;
};

const reportIssueOptionsKeyMap: ReportIssueOptionsKeyMap = {
    unknownWords: 'unknownWords',
};

export function extractReporterIssueOptions(settings: CSpellSettings): ReportIssueOptions | undefined {
    const options: ReportIssueOptions = {} as ReportIssueOptions;
    for (const key in reportIssueOptionsKeyMap) {
        const k = key as keyof ReportIssueOptions;
        const v = settings[k];
        if (v !== undefined) {
            options[k] = v;
        }
    }
    return options;
}
