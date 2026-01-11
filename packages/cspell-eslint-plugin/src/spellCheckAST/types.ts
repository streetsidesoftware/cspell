import type { ASTNode, NodeType } from './ASTNode.js';

interface ExtendedSuggestion {
    /**
     * The suggestion.
     */
    word: string;
    /**
     * The word is preferred above others, except other "preferred" words.
     */
    isPreferred?: boolean;
    /**
     * The suggested word adjusted to match the original case.
     */
    wordAdjustedToMatchCase?: string;
}

export type Suggestions = ExtendedSuggestion[] | undefined;

export interface Issue {
    start: number;
    end: number;
    word: string;
    severity: 'Forbidden' | 'Misspelled' | 'Unknown' | 'Hint';
    /** Possible suggestions. */
    suggestions: Suggestions;
    /** Indicates that there preferred suggestions. */
    hasPreferredFixes: boolean;
    hasSimpleSuggestions: boolean;
    preferredFixes: string[] | undefined;
    nodeType: NodeType;
    node: ASTNode | undefined;
}

export interface SpellCheckResults {
    issues: Issue[];
    errors?: Error[];
}
