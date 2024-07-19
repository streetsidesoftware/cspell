import type { CSpellReporter, ReporterConfiguration } from '@cspell/cspell-types';

import type { IConsole } from './console.js';
import type { LinterCliOptions } from './options.js';

export type ReporterConsole = IConsole;

export interface CSpellReporterConfiguration extends Readonly<ReporterConfiguration>, Readonly<LinterCliOptions> {
    /**
     * The console to use for reporting.
     * @since 8.11.1
     */
    readonly console?: ReporterConsole;
}

export interface CSpellReporterModule {
    getReporter: <T>(settings: T, config: CSpellReporterConfiguration) => CSpellReporter;
}
