import type { CSpellReporterModule, FileSettings, ReporterSettings } from 'cspell-lib';
import { CSpellReporter } from '@cspell/cspell-types';
import { ApplicationError } from './errors';

function mergeEmitters<T extends keyof CSpellReporter>(
    reporters: ReadonlyArray<CSpellReporter>,
    emitterName: T
): CSpellReporter[T] {
    return async (...args: unknown[]) => {
        // eslint-disable-next-line prefer-spread
        const results = reporters.map((reporter) => reporter[emitterName].apply(reporter, args));
        await Promise.all(results);
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
        result: mergeEmitters(reporters, 'result'),
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
    } catch (e) {
        throw new ApplicationError(`Failed to load reporter ${moduleName}: ${e.message}`);
    }
}

/**
 * Loads reporter modules configured in cspell config file
 */
export function loadReporters({ reporters = [] }: Pick<FileSettings, 'reporters'>): ReadonlyArray<CSpellReporter> {
    return reporters
        .map(loadReporter)
        .filter((v: CSpellReporter | undefined): v is CSpellReporter => v !== undefined);
}
