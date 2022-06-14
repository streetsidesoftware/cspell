export interface GrammarDef extends PatternPatterns {
    scopeName: ScopeSource;
    repository?: Repository | undefined;
}

/**
 * @pattern ^[-\w.]+$
 */
export type ScopeName = string;

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
    name: ScopeName;
    patterns?: undefined;
}

/**
 * A Pattern that contains only patterns
 */
export interface PatternPatterns extends PatternBase {
    patterns: PatternList;
}

interface PatternMatchBase extends PatternBase {
    begin?: Match | undefined;
    beginCaptures?: Captures | undefined;
    captures?: Captures | undefined;
    contentName?: ScopeName | undefined;
    end?: Match | undefined;
    endCaptures?: Captures | undefined;
    match?: Match | undefined;
    while?: Match | undefined;
    whileCaptures?: Captures | undefined;
}

/**
 * A pattern with a single match clause
 */
export interface PatternMatch extends PatternMatchBase {
    match: Match;
    captures?: Captures | undefined;
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
    end?: Match | undefined;
    match?: undefined;
    contentName?: ScopeName;
    captures?: Captures | undefined;
    beginCaptures?: Captures | undefined;
    endCaptures?: Captures | undefined;
    while?: undefined;
    whileCaptures?: undefined;
}

export interface PatternBeginWhile extends PatternMatchBase {
    begin: Match;
    end?: Match | undefined;
    match?: undefined;
    contentName?: ScopeName | undefined;
    captures?: Captures | undefined;
    beginCaptures?: Captures | undefined;
    endCaptures?: undefined;
    while: Match;
    whileCaptures?: Captures | undefined;
}

/**
 * Include patterns for including patterns from another pattern
 */
export interface PatternInclude extends PatternBase {
    include: PatternRef;
    name?: undefined;
    patterns?: undefined;
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

export type Captures = ScopeName | Record<string | number, PatternName | ScopeName>;

export interface PatternBase {
    /** Optional name scope */
    name?: ScopeName | undefined;
    /** Optional comment */
    comment?: string | undefined;
    /** Used to disable a rule. */
    disabled?: boolean | undefined;
    patterns?: PatternList | undefined;
}
