import type { Node } from 'estree';

import type { WorkerOptions } from '../common/options.js';
import type { NodeType } from './ASTNode.js';

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
}

type SpellCheckFn = (filename: string, text: string, root: Node, options: WorkerOptions) => Promise<Issue[]>;

export type SpellCheckSyncFn = (...p: Parameters<SpellCheckFn>) => Awaited<ReturnType<SpellCheckFn>>;
