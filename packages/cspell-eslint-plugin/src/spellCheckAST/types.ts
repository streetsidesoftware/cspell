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
    severity: 'Forbidden' | 'Unknown' | 'Hint';
    suggestions: Suggestions;
    nodeType: NodeType;
    node: ASTNode | undefined;
}

export interface SpellCheckResults {
    issues: Issue[];
    errors?: Error[];
}
