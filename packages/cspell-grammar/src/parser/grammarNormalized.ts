import { ScopePool } from './scope';
import type { LineOffsetAnchored, MatchResult } from './types';

export interface NGrammar {
    scopeName: NScopeSource;
    patterns: NPattern[];
    repository: NRepository;
    self: NPatternPatterns;
    name: NScope;
    contentName?: NScope | undefined;
    comment?: string | undefined;
    disabled?: boolean | undefined;
    scopePool: ScopePool;

    begin(rule?: Rule): GrammarRule;
}

/**
 * @pattern ^[-\w.]+$
 */
export type NScope = string;

/**
 * @pattern ^source\.[-\w.]+$
 */
export type NScopeSource = string;

export type NPattern =
    | NPatternBeginEnd
    | NPatternInclude
    | NPatternMatch
    | NPatternName
    | NPatternPatterns
    | NPatternRepositoryReference;

// export type PatternFn = () => _Pattern;

export type Match = string | RegExp;

/**
 * A Pattern with a name but no match clauses.
 * Used with Capture
 */
export interface NPatternName extends NPatternBase {
    name: NScope;
}

/**
 * A Pattern that contains only patterns
 */
export interface NPatternPatterns extends NPatternBase {
    patterns: NPattern[];
}

/**
 * A pattern with a single match clause
 */
export interface NPatternMatch extends NPatternBase {
    match: Match;
    captures?: NCaptures | undefined;
    contentName?: undefined;
}

/**
 * A Pattern with a Begin/End Match clause
 */
export interface NPatternBeginEnd extends NPatternBase {
    begin: Match;
    end?: Match | undefined;
    contentName?: NScope | undefined;
    captures?: NCaptures | undefined;
    beginCaptures?: NCaptures | undefined;
    endCaptures?: NCaptures | undefined;
}

/**
 * Include a pattern from the repository
 */
export interface NPatternRepositoryReference extends NPatternBase {
    reference: NRepositoryReference;
    name?: undefined;
    patterns?: undefined;
}

/**
 * Include patterns for including patterns from another pattern
 */
export interface NPatternInclude extends NPatternBase {
    include: IncludeExternalRef;
    name?: undefined;
    patterns?: undefined;
}

/**
 * Reference to a Repository pattern
 * @pattern ^([\w-]+|$self|$base)$
 */
export type NRepositoryReference = string;

/**
 * Reference to an external grammar.
 * @pattern ^source\..*$
 */
export type ExternalGrammarReference = string;

export type IncludeExternalRef = ExternalGrammarReference;

export type NRepository = Record<string, NPattern>;

export type NCaptures = Record<string | number, NScope>;

export interface Rule {
    id: number;
    grammar: NGrammar;
    pattern: NPattern | NGrammar;
    parent: Rule | undefined;
    repository: NRepository;
    depth: number;
    findNext?: ((line: LineOffsetAnchored) => MatchRuleResult | undefined) | undefined;
    end?: ((line: LineOffsetAnchored) => MatchResult | undefined) | undefined;
}

export interface GrammarRule extends Rule {
    pattern: NGrammar;
    findNext: (line: LineOffsetAnchored) => MatchRuleResult | undefined;
    end: (line: LineOffsetAnchored) => MatchResult | undefined;
}

export interface MatchRuleResult {
    rule: Rule;
    match: MatchResult;
    line: LineOffsetAnchored;
}

export interface NPatternBase {
    findMatch(line: LineOffsetAnchored, rule: Rule): MatchRuleResult | undefined;
    name?: NScope | undefined;
    contentName?: NScope | undefined;
    comment?: string | undefined;
    disabled?: boolean | undefined;
    patterns?: NPattern[] | undefined;
}
