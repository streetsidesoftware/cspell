import type { ExtendedSuggestion } from './Suggestion.js';
import type { ValidationResult } from './ValidationResult.js';

export interface ValidationIssue extends ValidationResult {
    suggestions?: string[] | undefined;
    suggestionsEx?: ExtendedSuggestion[] | undefined;

    /**
     * `true` - if it has been determined if simple suggestions are available.
     * `false` - if simple suggestions are NOT available.
     * `undefined` - if it has not been determined.
     */
    hasSimpleSuggestions?: boolean | undefined;

    /**
     * This setting is used for common typo detection.
     * `true` - if it has been determined if preferred suggestions are available.
     * `false` - if preferred suggestions are NOT available.
     * `undefined` - if it has not been determined.
     */
    hasPreferredSuggestions?: boolean | undefined;
}
