import { MatchResult } from './matchResult';

export interface NGrammar extends NPatternBase {
    scopeName: NScopeSource;
    patterns: NPattern[];
    find(line: LineOffset, rule: Rule | undefined): MatchingRule | undefined;
}

/**
 * @pattern ^[-\w.]+$
 */
export type NScope = string;

/**
 * @pattern ^source\.[-\w.]+$
 */
export type NScopeSource = string;

export type NPattern = NPatternMatch | NPatternBeginEnd | NPatternInclude | NPatternPatterns | NPatternName;

// export type PatternFn = () => _Pattern;

export type Match = string | RegExp;

/**
 * A pattern with a single match clause
 */
export interface NPatternMatch extends NPatternBase {
    match: Match;
    captures?: NCapture;
}

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
 * A Pattern with a Begin/End Match clause
 */
export interface NPatternBeginEnd extends NPatternBase {
    begin: Match;
    end?: Match;
    contentName?: NScope;
    captures?: NCapture;
    beginCaptures?: NCapture;
    endCapture?: NCapture;
}

/**
 * Include patterns for including patterns from another pattern
 */
export interface NPatternInclude extends NPatternBase {
    include: IncludeRef;
    name?: undefined;
    patterns?: undefined;
    repository?: undefined;
}

/**
 * Reference to a Repository pattern
 * @pattern ^(#.*|$self|$base)$
 */
export type NRepositoryReference = string;

/**
 * Reference to an external grammar.
 * @pattern ^source\..*$
 */
export type ExternalGrammarReference = string;

export type IncludeRef = NRepositoryReference | ExternalGrammarReference;

export type NRepository = Record<string, NPattern>;

export type NCapture = Record<string | number, NScope>;

export interface LineOffset {
    line: string;
    offset: number;
}

export interface Rule {
    grammar: NGrammar;
    match: MatchResult | undefined;
    pattern: NPattern;
    parent: Rule | undefined;
    repository: NRepository;
    depth: number;
    matchChildren?: (line: LineOffset) => MatchingRule | undefined;
    end?: (line: LineOffset) => MatchResult | undefined;
}

export interface MatchingRule extends Rule {
    match: MatchResult;
}

export interface NPatternBase {
    find(line: LineOffset, rule: Rule): MatchingRule | undefined;
    name?: NScope;
    patterns?: NPattern[];
    repository?: NRepository;
}
