import type { ValidationIssue } from '../Models/ValidationIssue.js';
import type { Handlers } from '../util/clone.js';
import { cloneInto, copy0, copy1 } from '../util/clone.js';

export function cleanValidationIssue(issue: ValidationIssue): ValidationIssue {
    const cleanIssue: ValidationIssue = {} as ValidationIssue;
    cloneInto(issue, cleanIssue, ValidationIssueHandlers);
    return cleanIssue;
}

const ValidationIssueHandlers: Handlers<ValidationIssue> = {
    text: copy0,
    offset: copy0,
    message: copy0,
    line: copy1,
    length: copy0,
    issueType: copy0,
    hasPreferredSuggestions: copy0,
    hasSimpleSuggestions: copy0,
    isFlagged: copy0,
    isFound: copy0,
    suggestions: copy1,
    suggestionsEx: copy1,
};
