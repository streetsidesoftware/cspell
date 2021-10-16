import type { LineOffsetAnchored, MatchResult } from './types';

export interface NGrammar extends NPatternBase {
    scopeName: NScopeSource;
    patterns: NPattern[];
    bind(rule?: Rule): Rule;
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
    captures?: NCaptures;
    contentName?: undefined;
}

/**
 * A Pattern with a Begin/End Match clause
 */
export interface NPatternBeginEnd extends NPatternBase {
    begin: Match;
    end?: Match;
    contentName?: NScope;
    captures?: NCaptures;
    beginCaptures?: NCaptures;
    endCaptures?: NCaptures;
}

/**
 * Include a pattern from the repository
 */
export interface NPatternRepositoryReference extends NPatternBase {
    reference: NRepositoryReference;
    name?: undefined;
    patterns?: undefined;
    repository?: undefined;
}

/**
 * Include patterns for including patterns from another pattern
 */
export interface NPatternInclude extends NPatternBase {
    include: IncludeExternalRef;
    name?: undefined;
    patterns?: undefined;
    repository?: undefined;
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
    grammar: NGrammar;
    pattern: NPattern;
    parent: Rule | undefined;
    repository: NRepository;
    depth: number;
    findMatch: (line: LineOffsetAnchored) => MatchRuleResult | undefined;
    findNext?: (line: LineOffsetAnchored) => MatchRuleResult | undefined;
    end?: (line: LineOffsetAnchored) => MatchResult | undefined;
}

export interface MatchRuleResult {
    rule: Rule;
    match: MatchResult;
    line: LineOffsetAnchored;
}

export interface NPatternBase {
    bind(rule: Rule): Rule;
    name?: NScope;
    contentName?: NScope;
    comment?: string;
    disabled?: boolean;
    patterns?: NPattern[];
    repository?: NRepository;
}
