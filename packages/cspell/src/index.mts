export type { AppError, CheckTextResult, TraceResult } from './application.mjs';
export {
    checkText,
    createInit,
    IncludeExcludeFlag,
    lint,
    listDictionaries,
    parseApplicationFeatureFlags,
    suggestions,
    trace,
} from './application.mjs';
export { getReporter as getDefaultReporter } from './cli-reporter.js';
export type { CSpellReporterConfiguration, CSpellReporterModule } from './models.js';
export type { BaseOptions, LinterCliOptions as CSpellApplicationOptions, TraceOptions } from './options.js';
export * from '@cspell/cspell-types';
