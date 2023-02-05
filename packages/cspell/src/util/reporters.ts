import type {
    CSpellReporter,
    CSpellReporterModule,
    FileSettings,
    ReporterConfiguration,
    ReporterSettings,
    RunResult,
} from '@cspell/cspell-types';
import { dynamicImport } from '@cspell/dynamic-import';

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

export type FinalizedReporter = Required<CSpellReporter>;

function extractEmitter<K extends keyof StandardEmitters>(
    reporters: ReadonlyArray<StandardEmitters>,
    emitterName: K
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

/**
 * Mergers several cspell reporters into a single one
 */
export function mergeReporters(...reporters: ReadonlyArray<CSpellReporter>): FinalizedReporter {
    return {
        issue: callAll(extractEmitter(reporters, 'issue')),
        info: callAll(extractEmitter(reporters, 'info')),
        debug: callAll(extractEmitter(reporters, 'debug')),
        progress: callAll(extractEmitter(reporters, 'progress')),
        error: callAll(extractEmitter(reporters, 'error')),
        result: mergeResultEmitters(reporters),
    };
}

/**
 * Loads reporter modules configured in cspell config file
 */
export async function loadReporters(
    reporters: FileSettings['reporters'],
    defaultReporter: CSpellReporter,
    config: ReporterConfiguration
): Promise<ReadonlyArray<CSpellReporter>> {
    async function loadReporter(reporterSettings: ReporterSettings): Promise<CSpellReporter | undefined> {
        if (reporterSettings === 'default') return defaultReporter;
        if (!Array.isArray(reporterSettings)) {
            reporterSettings = [reporterSettings];
        }
        const [moduleName, settings] = reporterSettings;

        try {
            const { getReporter }: CSpellReporterModule = await dynamicImport(moduleName, [process.cwd(), __dirname]);
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
