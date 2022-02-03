/**
 * This file is here to support code the referenced suggest directly and limit the exports.
 */
export {
    compSuggestionResults,
    defaultSuggestionCollectorOptions,
    impersonateCollector,
    isSuggestionResult,
    suggestionCollector,
} from './suggestions/suggestCollector';
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
