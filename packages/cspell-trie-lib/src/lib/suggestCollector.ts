/**
 * This file is here to support code the referenced suggest directly and limit the exports.
 */
export type { FilterWordFn, SuggestionCollector, SuggestionCollectorOptions } from './suggestions/suggestCollector.ts';
export {
    compSuggestionResults,
    defaultSuggestionCollectorOptions,
    impersonateCollector,
    isSuggestionResult,
    suggestionCollector,
} from './suggestions/suggestCollector.ts';
export type {
    Cost,
    GenerateNextParam,
    GenerateSuggestionResult,
    MaxCost,
    Progress,
    SuggestionGenerator,
    SuggestionResult,
} from './suggestions/SuggestionTypes.ts';
