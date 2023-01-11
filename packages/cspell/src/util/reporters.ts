import type {
    CSpellReporter,
    CSpellReporterModule,
    FileSettings,
    ReporterSettings,
    RunResult,
} from '@cspell/cspell-types';

import { ApplicationError, toError } from './errors';

type StandardEmitters = Omit<CSpellReporter, 'result'>;

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

function extractEmitter<K extends keyof StandardEmitters>(
    reporters: ReadonlyArray<StandardEmitters>,
    emitterName: K
): StandardEmitters[K][] {
    // The `bind` is used in case the reporter is a class.
    return reporters.map((r) => r[emitterName].bind(r) as StandardEmitters[K]);
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
        issue: callAll(extractEmitter(reporters, 'issue')),
        info: callAll(extractEmitter(reporters, 'info')),
        debug: callAll(extractEmitter(reporters, 'debug')),
        progress: callAll(extractEmitter(reporters, 'progress')),
        error: callAll(extractEmitter(reporters, 'error')),
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
