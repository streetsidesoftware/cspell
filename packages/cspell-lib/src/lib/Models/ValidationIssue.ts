import type { ExtendedSuggestion } from './Suggestion.js';
import type { ValidationResult } from './ValidationResult.js';

export interface ValidationIssue extends ValidationResult {
    suggestions?: string[];
    suggestionsEx?: ExtendedSuggestion[];
}
