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
    Rule,
} from './grammarNormalized';
import { isPatternBeginEnd, isPatternInclude, isPatternMatch, isPatternPatterns } from './grammarTypesHelpers';
import { createMatchResult, createSimpleMatchResult } from './matchResult';
import type { LineOffsetAnchored, MatchResult } from './types';

export function normalizeGrammar(grammar: Grammar): NGrammar {
    const { scopeName, name, ...rest } = grammar;
    const pp = nPattern({ ...grammar, name: scopeName });
    const repository = pp.repository ?? Object.create(null);
    pp.repository = repository;
    const g: NGrammar = {
        ...rest,
        scopeName,
        name,
        patterns: pp.patterns,
        repository,
        bind,
    };

    function bind(rule: Rule | undefined): Rule {
        const grammarRule: Rule = {
            ...grammarToRule(g, pp, rule),
            findMatch,
        };

        function findMatch(line: LineOffsetAnchored): MatchRuleResult | undefined {
            return findInPatterns(pp.patterns, line, grammarRule);
        }
        return grammarRule;
    }

    return g;
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
    const { repository } = normalizePatternRepository(p);
    const self: NPatternMatch = {
        ...p,
        repository,
        captures: normalizeCapture(p.captures),
        bind,
    };

    const regExec = makeExec(p.match);

    function bind(parentRule: Rule): Rule {
        const rule: Rule = {
            ...appendRule(parentRule, self),
            findMatch,
        };

        function findMatch(line: LineOffsetAnchored): MatchRuleResult | undefined {
            const match = regExec(line);
            if (!match) return undefined;
            return { rule, match, line };
        }

        return rule;
    }

    return self;
}

function normalizePatternBeginEnd(p: PatternBeginEnd): NPatternBeginEnd {
    const { repository } = normalizePatternRepository(p);
    const { patterns } = normalizePatternPatterns(p);
    const self: NPatternBeginEnd = {
        ...p,
        captures: normalizeCapture(p.captures),
        beginCaptures: normalizeCapture(p.beginCaptures),
        endCaptures: normalizeCapture(p.endCaptures),
        repository,
        patterns,
        bind,
    };

    const regExec = makeExec(p.begin);

    function bind(parentRule: Rule): Rule {
        const rule: Rule = {
            ...appendRule(parentRule, self),
            findMatch,
        };

        function findMatch(line: LineOffsetAnchored): MatchRuleResult | undefined {
            const match = regExec(line);
            if (!match) return undefined;
            return { rule, match, line };
        }

        return rule;
    }

    return self;
}

function normalizePatternName(p: PatternName): NPatternName {
    const repository = undefined;
    const patterns = undefined;
    const self: NPatternName = {
        ...p,
        repository,
        patterns,
        bind,
    };

    function bind(parentRule: Rule): Rule {
        const rule: Rule = {
            ...appendRule(parentRule, self),
            findMatch,
        };

        function findMatch(line: LineOffsetAnchored): MatchRuleResult | undefined {
            const input = line.text.slice(line.offset);
            const match = createSimpleMatchResult(input, input, line.offset);
            return { rule, match, line };
        }
        return rule;
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
        bind,
    };

    function findRef(rule: Rule): Rule {
        const pat = rule.repository[reference];
        if (pat === undefined) throw new Error(`Unknown Include Reference ${include}`);
        return pat.bind(rule);
    }

    function bind(parentRule: Rule): Rule {
        const rule: Rule = {
            ...appendRule(parentRule, self),
            findMatch,
        };

        function findMatch(line: LineOffsetAnchored): MatchRuleResult | undefined {
            return findRef(rule).findMatch(line);
        }
        return rule;
    }

    return self;
}

function normalizePatternIncludeExt(p: PatternInclude): NPatternInclude | NPatternRepositoryReference {
    const self: NPatternInclude = {
        ...p,
        bind,
    };

    if (!p.include.startsWith('#')) {
        throw new Error('External Imports not yet supported');
    }

    function bind(parentRule: Rule): Rule {
        const rule: Rule = {
            ...appendRule(parentRule, self),
            findMatch,
        };

        function findMatch(_line: LineOffsetAnchored): MatchRuleResult | undefined {
            return undefined;
        }
        return rule;
    }

    return self;
}

function normalizePatternsPatterns(p: PatternPatterns): NPatternPatterns {
    const { repository } = normalizePatternRepository(p);
    const { patterns } = normalizePatternPatterns(p);
    const self: NPatternPatterns = {
        ...p,
        repository,
        patterns,
        bind,
    };

    function bind(parentRule: Rule): Rule {
        const rule: Rule = {
            ...appendRule(parentRule, self),
            findMatch,
        };

        function findMatch(line: LineOffsetAnchored): MatchRuleResult | undefined {
            return findInPatterns(self.patterns, line, rule);
        }
        return rule;
    }

    return self;
}

function findInPatterns(patterns: NPattern[], line: LineOffsetAnchored, rule: Rule): MatchRuleResult | undefined {
    let r: MatchRuleResult | undefined = undefined;
    for (const pat of patterns) {
        if (pat.disabled) continue;
        const pRule = pat.bind(rule);
        const er = pRule.findMatch(line);
        if (er?.match !== undefined) {
            r = (r && r.match && r.match.index < er.match.index && r) || er;
        }
    }
    return r;
}

function normalizePatternPatterns(p: { patterns: PatternList }): { patterns: NPattern[] };
function normalizePatternPatterns(p: { patterns: undefined }): { patterns: undefined };
function normalizePatternPatterns(p: { patterns?: PatternList }): { patterns?: NPattern[] };
function normalizePatternPatterns(p: { patterns?: PatternList }): { patterns?: NPattern[] } {
    const patterns = p.patterns ? normalizePatterns(p.patterns) : undefined;
    return { patterns };
}

function normalizePatterns(patterns: PatternList): NPattern[] {
    return patterns.map((p) => (typeof p === 'string' ? { include: p } : p)).map(nPattern);
}

function normalizePatternRepository(p: { repository?: Repository }): { repository?: NRepository } {
    const rep = p.repository;
    if (!rep) return {};

    const repository = normalizeRepository(rep);
    return { repository };
}

function normalizeRepository(rep: Repository): NRepository {
    const repository: NRepository = {};
    for (const [key, pat] of Object.entries(rep)) {
        repository[key] = nPattern(pat);
    }
    return repository;
}

type AppendRuleResult = Pick<Rule, 'grammar' | 'pattern' | 'parent' | 'depth' | 'repository'>;

function appendRule(parent: Rule, pattern: NPattern): AppendRuleResult {
    const { repository, depth } = parent;
    const rep = !pattern.repository ? repository : Object.assign(Object.create(null), repository, pattern.repository);
    return {
        grammar: parent.grammar,
        pattern,
        parent,
        repository: rep,
        depth: depth + 1,
    };
}

function grammarToRule(grammar: NGrammar, pattern: NPatternPatterns, parent: Rule | undefined): AppendRuleResult {
    const depth = 0;
    const repository = Object.create(null);
    grammar.repository && Object.assign(repository, pattern.repository);
    repository['$self'] = pattern;
    repository['$base'] = repository['$base'] || pattern;
    return {
        grammar,
        pattern,
        parent,
        repository,
        depth,
    };
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

function makeExec(reg: string | RegExp): (line: LineOffsetAnchored) => MatchResult | undefined {
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
        const rg = RegExp(r, 'g');
        rg.lastIndex = line.offset;
        const m = rg.exec(line.text);
        return (m && createMatchResult(m)) ?? undefined;
    };
}

export function extractScope(er: Rule): string[] {
    const scope: string[] = [];

    for (let rule: Rule | undefined = er; rule; rule = rule.parent) {
        const name = rule.pattern.name;
        if (name !== undefined) {
            scope.push(name);
        }
    }

    return scope;
}
