import type {
    CSpellReporter,
    CSpellReporterModule,
    FileSettings,
    ReporterSettings,
    RunResult,
} from '@cspell/cspell-types';
import { ApplicationError, toError } from './errors';

function mergeEmitters<T extends keyof Omit<CSpellReporter, 'result'>>(
    reporters: ReadonlyArray<CSpellReporter>,
    emitterName: T
): CSpellReporter[T] {
    return async (...args: unknown[]) => {
        // eslint-disable-next-line prefer-spread
        reporters.forEach((reporter: any) => reporter[emitterName].apply(reporter, args));
    };
}

function mergeResultEmitters(reporters: ReadonlyArray<CSpellReporter>): CSpellReporter['result'] {
    return async (result: RunResult) => {
        await Promise.all(reporters.map((reporter) => reporter.result(result)));
    };
}

/**
 * Mergers several cspell reporters into a single one
 */
export function mergeReporters(...reporters: ReadonlyArray<CSpellReporter>): CSpellReporter {
    return {
        issue: mergeEmitters(reporters, 'issue'),
        info: mergeEmitters(reporters, 'info'),
        debug: mergeEmitters(reporters, 'debug'),
        progress: mergeEmitters(reporters, 'progress'),
        error: mergeEmitters(reporters, 'error'),
        result: mergeResultEmitters(reporters),
    };
}

function loadReporter(reporterSettings: ReporterSettings): CSpellReporter | undefined {
    if (!Array.isArray(reporterSettings)) {
        reporterSettings = [reporterSettings];
    }
    const [moduleName, settings] = reporterSettings;

    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { getReporter }: CSpellReporterModule = require(moduleName);
        return getReporter(settings);
    } catch (e: unknown) {
        throw new ApplicationError(`Failed to load reporter ${moduleName}: ${toError(e).message}`);
    }
}

/**
 * Loads reporter modules configured in cspell config file
 */
export function loadReporters({ reporters = [] }: Pick<FileSettings, 'reporters'>): ReadonlyArray<CSpellReporter> {
    return reporters.map(loadReporter).filter((v: CSpellReporter | undefined): v is CSpellReporter => v !== undefined);
}
