/**
 * This file is here to support code the referenced suggest directly and limit the exports.
 */
export type {
    Cost,
    FilterWordFn,
    GenerateNextParam,
    GenerateSuggestionResult,
    MaxCost,
    Progress,
    SuggestionCollector,
    SuggestionCollectorOptions,
    SuggestionGenerator,
    SuggestionResult,
} from './suggestions/suggestCollector';
export {
    compSuggestionResults,
    defaultSuggestionCollectorOptions,
    impersonateCollector,
    isSuggestionResult,
    suggestionCollector,
} from './suggestions/suggestCollector';
