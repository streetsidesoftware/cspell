import type { Node } from 'estree';

import type { WorkerOptions } from '../common/options.cjs';
import type { ASTNode, NodeType } from './ASTNode.mjs';

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

export type SpellCheckFn = (
    filename: string,
    text: string,
    root: Node,
    options: WorkerOptions,
) => Promise<SpellCheckResults>;

export type SpellCheckSyncFn = (...p: Parameters<SpellCheckFn>) => Awaited<ReturnType<SpellCheckFn>>;
