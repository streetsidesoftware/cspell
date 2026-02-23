import type { ExtendedSuggestion } from './Suggestion.js';
import type { ValidationResult, ValidationResultRPC } from './ValidationResult.js';

export interface ValidationIssue extends ValidationResult {
    suggestions?: string[] | undefined;
    suggestionsEx?: ExtendedSuggestion[] | undefined;
}

/**
 * The ValidationIssueRPC is used for RPC communication. It is a subset of ValidationIssue that can be serialized.
 */
export interface ValidationIssueRPC extends ValidationResultRPC {
    suggestionsEx?: ExtendedSuggestion[] | undefined;
}

export function toValidationIssueRPC(issue: ValidationIssue, index?: number): ValidationIssueRPC;
export function toValidationIssueRPC(issue: ValidationIssue): ValidationIssueRPC {
    const {
        text,
        length,
        offset,
        message,
        issueType,
        hasPreferredSuggestions,
        hasSimpleSuggestions,
        isFlagged,
        isFound,
        suggestionsEx,
    } = issue;
    return {
        text,
        offset,
        length,
        message,
        issueType,
        hasPreferredSuggestions,
        hasSimpleSuggestions,
        isFlagged,
        isFound,
        suggestionsEx,
    };
}
