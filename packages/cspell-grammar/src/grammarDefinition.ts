export interface Grammar extends PatternBase {
    scopeName: ScopeSource;
    patterns: Pattern[];
}

/**
 * @pattern ^[-\w.]+$
 */
export type Scope = string;

/**
 * @pattern ^source\.[-\w.]+$
 */
export type ScopeSource = string;

export type Pattern = _Pattern; // | PatternFn;

type _Pattern = PatternMatch | PatternBeginEnd | PatternName | PatternInclude | PatternPatterns;

// export type PatternFn = () => _Pattern;

export type Match = string | RegExp;

/**
 * A pattern with a single match clause
 */
export interface PatternMatch extends PatternBase {
    match: Match;
    captures?: Capture;
}

/**
 * A Pattern with a name but no match clauses.
 */
export interface PatternName extends PatternBase {
    name: Scope;
}

/**
 * A Pattern that contains only patterns
 */
export interface PatternPatterns extends PatternBase {
    patterns: Pattern[];
}

/**
 * A Pattern with a Begin/End Match clause
 */
export interface PatternBeginEnd extends PatternBase {
    begin: Match;
    end?: Match;
    contentName?: Scope;
    captures?: Capture;
    beginCaptures?: Capture;
    endCapture?: Capture;
}

/**
 * Include patterns for including patterns from another pattern
 */
export interface PatternInclude extends PatternBase {
    include: IncludeRef;
    name?: undefined;
    patterns?: undefined;
    repository?: undefined;
}

/**
 * Reference to a Repository pattern
 * @pattern ^(#.*|$self|$base)$
 */
export type RepositoryReference = string;

/**
 * Reference to an external grammar.
 * @pattern ^source\..*$
 */
export type ExternalGrammarReference = string;

export type IncludeRef = RepositoryReference | ExternalGrammarReference;

export type Repository = Record<string, Pattern>;

export type Capture = Scope | Record<string | number, Pattern>;

export interface PatternBase {
    name?: Scope;
    patterns?: Pattern[];
    repository?: Repository;
}
