export interface Grammar extends PatternPatterns {
    scopeName: ScopeSource;
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

type _Pattern = PatternMatch | PatternBeginEnd | PatternInclude | PatternPatterns | PatternName;

// export type PatternFn = () => _Pattern;

export type PatternList = (Pattern | PatternRef)[];

export type Match = string | RegExp;

/**
 * A Pattern with a name but no match clauses.
 * Used in Capture
 */
export interface PatternName extends PatternBase {
    name: Scope;
    patterns?: undefined;
    repository?: undefined;
}

/**
 * A Pattern that contains only patterns
 */
export interface PatternPatterns extends PatternBase {
    patterns: PatternList;
}

interface PatternMatchBase extends PatternBase {
    begin?: Match;
    beginCaptures?: Capture;
    captures?: Capture;
    contentName?: Scope;
    end?: Match;
    endCaptures?: Capture;
    match?: Match;
    while?: Match;
    whileCaptures?: Capture;
}

/**
 * A pattern with a single match clause
 */
export interface PatternMatch extends PatternMatchBase {
    match: Match;
    captures?: Capture;
    patterns?: undefined;
    begin?: undefined;
    end?: undefined;
    contentName?: undefined;
    beginCaptures?: undefined;
    endCaptures?: undefined;
    while?: undefined;
    whileCaptures?: undefined;
}

/**
 * A Pattern with a Begin/End Match clause
 */
export interface PatternBeginEnd extends PatternMatchBase {
    begin: Match;
    end?: Match;
    match?: undefined;
    contentName?: Scope;
    captures?: Capture;
    beginCaptures?: Capture;
    endCaptures?: Capture;
    while?: undefined;
    whileCaptures?: undefined;
}

export interface PatternBeginWhile extends PatternMatchBase {
    begin: Match;
    end?: Match;
    match?: undefined;
    contentName?: Scope;
    captures?: Capture;
    beginCaptures?: Capture;
    endCaptures?: undefined;
    while: Match;
    whileCaptures?: Capture;
}

/**
 * Include patterns for including patterns from another pattern
 */
export interface PatternInclude extends PatternBase {
    include: PatternRef;
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

export type PatternRef = RepositoryReference | ExternalGrammarReference;

export type Repository = Record<string, Pattern>;

export type Capture = Scope | Record<string | number, PatternName | Scope>;

export interface PatternBase {
    /** Optional name scope */
    name?: Scope;
    /** Optional comment */
    comment?: string;
    /** Used to disable a rule. */
    disabled?: boolean;
    patterns?: PatternList;
    repository?: Repository;
}
