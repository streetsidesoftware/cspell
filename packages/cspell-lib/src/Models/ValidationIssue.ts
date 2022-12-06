import type { ExtendedSuggestion } from './Suggestion';
import type { ValidationResult } from './ValidationResult';

export interface ValidationIssue extends ValidationResult {
    suggestions?: string[];
    suggestionsEx?: ExtendedSuggestion[];
}
