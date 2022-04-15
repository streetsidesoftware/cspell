import { Grammar, Pattern, Repository } from '..';
import {
    Captures,
    PatternBeginEnd,
    PatternInclude,
    PatternList,
    PatternMatch,
    PatternName,
    PatternPatterns,
} from './grammarDefinition';
import {
    GrammarRule,
    MatchRuleResult,
    NCaptures,
    NGrammar,
    NPattern,
    NPatternBeginEnd,
    NPatternInclude,
    NPatternMatch,
    NPatternName,
    NPatternPatterns,
    NPatternRepositoryReference,
    NRepository,
    NScope,
    NScopeSource,
    Rule,
} from './grammarNormalized';
import { isPatternBeginEnd, isPatternInclude, isPatternMatch, isPatternPatterns } from './grammarTypesHelpers';
import { createMatchResult, createSimpleMatchResult } from './matchResult';
import type { LineOffsetAnchored, MatchResult } from './types';

export function normalizeGrammar(grammar: Grammar): NGrammar {
    return new ImplNGrammar(grammar);
}

const SpecialRepositoryReferences: Record<string, true | undefined> = {
    $self: true,
    $base: true,
};

export function nPattern(p: PatternMatch): NPatternMatch;
export function nPattern(p: PatternInclude): NPatternInclude;
export function nPattern(p: PatternBeginEnd): NPatternBeginEnd;
export function nPattern(p: PatternPatterns): NPatternPatterns;
export function nPattern(p: PatternName): NPatternName;
export function nPattern(p: Pattern): NPattern;
export function nPattern(p: Pattern): NPattern {
    if (isPatternMatch(p)) return normalizePatternMatch(p);
    if (isPatternBeginEnd(p)) return normalizePatternBeginEnd(p);
    if (isPatternInclude(p)) return normalizePatternInclude(p);
    if (isPatternPatterns(p)) return normalizePatternsPatterns(p);
    return normalizePatternName(p);
}

function normalizePatternMatch(p: PatternMatch): NPatternMatch {
    const regExec = makeTestMatchFn(p.match);
    const self: NPatternMatch = {
        ...p,
        captures: normalizeCapture(p.captures),
        findMatch,
    };

    function findMatch(line: LineOffsetAnchored, parentRule: Rule): MatchRuleResult | undefined {
        const match = regExec(line);
        if (!match) return undefined;
        const rule = factoryRule(parentRule, self);
        return { rule, match, line };
    }

    return self;
}

function normalizePatternBeginEnd(p: PatternBeginEnd): NPatternBeginEnd {
    const patterns = normalizePatterns(p.patterns);
    const self: NPatternBeginEnd = {
        ...p,
        captures: normalizeCapture(p.captures),
        beginCaptures: normalizeCapture(p.beginCaptures),
        endCaptures: normalizeCapture(p.endCaptures),
        patterns,
        findMatch,
    };

    function findMatch(line: LineOffsetAnchored, parentRule: Rule): MatchRuleResult | undefined {
        const match = testBegin(line);
        if (!match) return undefined;
        const rule = factoryRule(parentRule, self, findNext, end);
        return { rule, match, line };
    }

    const testBegin = makeTestMatchFn(p.begin);
    const testEnd = p.end !== undefined ? makeTestMatchFn(p.end) : () => undefined;

    function findNext(this: Rule, line: LineOffsetAnchored) {
        return patterns && findInPatterns(patterns, line, this);
    }

    function end(line: LineOffsetAnchored): MatchResult | undefined {
        return testEnd(line);
    }

    return self;
}

function normalizePatternName(p: PatternName): NPatternName {
    const patterns = undefined;
    const self: NPatternName = {
        ...p,
        patterns,
        findMatch,
    };

    function findMatch(line: LineOffsetAnchored, parentRule: Rule): MatchRuleResult | undefined {
        const rule = factoryRule(parentRule, self);
        const input = line.text.slice(line.offset);
        const match = createSimpleMatchResult(input, input, line.offset);
        return { rule, match, line };
    }

    return self;
}

function normalizePatternInclude(p: PatternInclude): NPatternInclude | NPatternRepositoryReference {
    const { include } = p;
    return include.startsWith('#') || include in SpecialRepositoryReferences
        ? normalizePatternIncludeRef(p)
        : normalizePatternIncludeExt(p);
}

function normalizePatternIncludeRef(p: PatternInclude): NPatternRepositoryReference {
    const { include, ...rest } = p;
    const reference = include.startsWith('#') ? include.slice(1) : include;
    const self: NPatternRepositoryReference = {
        ...rest,
        reference,
        findMatch,
    };

    function findMatch(line: LineOffsetAnchored, parentRule: Rule): MatchRuleResult | undefined {
        const pat = parentRule.repository[reference];
        if (pat === undefined) throw new Error(`Unknown Include Reference ${include}`);
        return pat.findMatch(line, parentRule);
    }

    return self;
}

function normalizePatternIncludeExt(p: PatternInclude): NPatternInclude | NPatternRepositoryReference {
    function findMatch(_line: LineOffsetAnchored): MatchRuleResult | undefined {
        return undefined;
    }

    const self: NPatternInclude = {
        ...p,
        findMatch,
    };

    return self;
}

function normalizePatternsPatterns(p: PatternPatterns): NPatternPatterns {
    return new ImplNPatternPatterns(p);
}

function findInPatterns(patterns: NPattern[], line: LineOffsetAnchored, rule: Rule): MatchRuleResult | undefined {
    let r: MatchRuleResult | undefined = undefined;
    for (const pat of patterns) {
        if (pat.disabled) continue;
        const er = pat.findMatch(line, rule);
        if (er?.match !== undefined && !er.rule.pattern.disabled) {
            r = (r && r.match && r.match.index < er.match.index && r) || er;
        }
    }
    return r;
}

function normalizePatterns(patterns: undefined): undefined;
function normalizePatterns(patterns: PatternList): NPattern[];
function normalizePatterns(patterns: PatternList | undefined): NPattern[] | undefined;
function normalizePatterns(patterns: PatternList | undefined): NPattern[] | undefined {
    if (!patterns) return undefined;
    return patterns.map((p) => (typeof p === 'string' ? { include: p } : p)).map(nPattern);
}

const emptyRepository: NRepository = Object.freeze(Object.create(null));

function normalizePatternRepository(rep: Repository | undefined): NRepository {
    if (!rep) return emptyRepository;

    return normalizeRepository(rep);
}

function normalizeRepository(rep: Repository): NRepository {
    const repository: NRepository = Object.create(null);
    for (const [key, pat] of Object.entries(rep)) {
        repository[key] = nPattern(pat);
    }
    return repository;
}

let ruleCounter = 0;

function factoryRuleBase(
    parent: Rule | undefined,
    pattern: NGrammar,
    repository: NRepository,
    grammar: NGrammar,
    findNext: (this: Rule, line: LineOffsetAnchored) => MatchRuleResult | undefined,
    end: (this: Rule, line: LineOffsetAnchored) => MatchResult | undefined
): GrammarRule;
function factoryRuleBase(
    parent: Rule | undefined,
    pattern: NPattern | NGrammar,
    repository: NRepository,
    grammar: NGrammar,
    findNext?: (this: Rule, line: LineOffsetAnchored) => MatchRuleResult | undefined,
    end?: (this: Rule, line: LineOffsetAnchored) => MatchResult | undefined
): Rule;
function factoryRuleBase(
    parent: Rule | undefined,
    pattern: NPattern | NGrammar,
    repository: NRepository,
    grammar: NGrammar,
    findNext?: (this: Rule, line: LineOffsetAnchored) => MatchRuleResult | undefined,
    end?: (this: Rule, line: LineOffsetAnchored) => MatchResult | undefined
): Rule {
    const depth = parent ? parent.depth + 1 : 0;
    return {
        id: ruleCounter++,
        grammar,
        pattern,
        parent,
        repository,
        depth,
        findNext,
        end,
    };
}

function factoryRule(
    parent: Rule,
    pattern: NPattern,
    findNext?: (this: Rule, line: LineOffsetAnchored) => MatchRuleResult | undefined,
    end?: (this: Rule, line: LineOffsetAnchored) => MatchResult | undefined
): Rule {
    return factoryRuleBase(parent, pattern, parent.repository, parent.grammar, findNext, end);
}

function normalizeCapture(cap: Captures | undefined): NCaptures | undefined {
    if (cap === undefined) return undefined;
    if (typeof cap === 'string') return { [0]: cap };

    const capture: NCaptures = Object.create(null);
    for (const [key, pat] of Object.entries(cap)) {
        capture[key] = typeof pat === 'string' ? pat : normalizePatternName(pat).name;
    }

    return capture;
}

function makeTestMatchFn(reg: string | RegExp): (line: LineOffsetAnchored) => MatchResult | undefined {
    if (typeof reg === 'string') return matchString(reg);
    return matchRegExp(reg);
}

function matchString(s: string): (line: LineOffsetAnchored) => MatchResult | undefined {
    return (line) => {
        const input = line.text;
        const index = input.indexOf(s, line.offset);
        if (index < 0) return undefined;
        return createSimpleMatchResult(s, input, index);
    };
}

function matchRegExp(r: RegExp): (line: LineOffsetAnchored) => MatchResult | undefined {
    return (line) => {
        const rg = RegExp(r, 'gm');
        rg.lastIndex = line.offset;
        const m = rg.exec(line.text);
        return (m && createMatchResult(m)) ?? undefined;
    };
}

export function extractScope(er: Rule, isContent = true): string[] {
    const scope: string[] = [];

    for (let rule: Rule | undefined = er; rule; rule = rule.parent) {
        const pattern = rule.pattern;
        const { name, contentName } = pattern;
        if (contentName && isContent) {
            scope.push(contentName);
        }
        if (name !== undefined) {
            scope.push(name);
        }
        isContent = true;
    }

    return scope;
}

class ImplNGrammar implements NGrammar {
    readonly scopeName: NScopeSource;
    readonly name: NScopeSource;
    readonly comment: string | undefined;
    readonly disabled: boolean | undefined;
    readonly patterns: NPattern[];
    readonly repository: NRepository;
    readonly grammarName: string | undefined;
    readonly self: NPatternPatterns;

    constructor(grammar: Grammar) {
        this.scopeName = grammar.scopeName;
        this.name = grammar.scopeName;
        this.comment = grammar.comment;
        this.disabled = grammar.disabled;
        this.grammarName = grammar.name;

        const self = nPattern({
            patterns: [{ patterns: grammar.patterns }],
        });
        const repository = normalizePatternRepository(grammar.repository);

        this.patterns = self.patterns;
        this.repository = repository;
        this.self = self;
    }

    begin(parentRule?: Rule): GrammarRule {
        const patterns = this.patterns;

        function grammarToRule(grammar: NGrammar, baseGrammar: NGrammar, parent: Rule | undefined): GrammarRule {
            const repository: NRepository = Object.create(null);
            Object.assign(repository, grammar.repository);
            repository['$self'] = grammar.self;
            repository['$base'] = repository['$base'] || baseGrammar.self;

            function findNext(this: Rule, line: LineOffsetAnchored): MatchRuleResult | undefined {
                return findInPatterns(patterns, line, this);
            }
            function end(_line: LineOffsetAnchored) {
                return undefined;
            }

            return factoryRuleBase(parent, grammar, repository, grammar, findNext, end);
        }

        return grammarToRule(this, parentRule?.grammar ?? this, parentRule);
    }
}

class ImplNPatternPatterns implements NPatternPatterns {
    readonly name: NScope | undefined;
    readonly comment: string | undefined;
    readonly disabled: boolean | undefined;
    readonly patterns: NPattern[];

    constructor(p: PatternPatterns) {
        const { name, comment, disabled, ...rest } = p;
        this.patterns = normalizePatterns(rest.patterns);
        this.name = name;
        this.comment = comment;
        this.disabled = disabled;
    }

    findMatch(line: LineOffsetAnchored, parentRule: Rule): MatchRuleResult | undefined {
        const patterns = this.patterns;
        const rule = factoryRule(parentRule, this, findNext);
        function findNext(this: Rule, line: LineOffsetAnchored): MatchRuleResult | undefined {
            return findInPatterns(patterns, line, this);
        }
        return rule.findNext?.(line);
    }
}
