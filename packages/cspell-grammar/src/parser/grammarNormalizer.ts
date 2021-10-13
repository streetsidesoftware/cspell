import { Grammar, Pattern, Repository } from '..';
import {
    Capture,
    PatternBeginEnd,
    PatternInclude,
    PatternMatch,
    PatternName,
    PatternPatterns,
} from './grammarDefinition';
import {
    LineOffset,
    MatchingRule,
    NCapture,
    NGrammar,
    NPattern,
    NPatternBeginEnd,
    NPatternInclude,
    NPatternMatch,
    NPatternName,
    NPatternPatterns,
    NRepository,
    Rule,
} from './grammarNormalized';
import { isPatternBeginEnd, isPatternInclude, isPatternMatch, isPatternPatterns } from './grammarTypesHelpers';
import { createMatchResult, createSimpleMatchResult, MatchResult } from './matchResult';

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
        find,
    };

    function find(line: LineOffset, rule: Rule | undefined): MatchingRule | undefined {
        const grammarRule = grammarToRule(g, pp);
        grammarRule.parent = rule;
        return findInPatterns(pp.patterns, line, grammarRule);
    }

    return g;
}

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
        find: exec,
    };

    const regExec = makeExec(p.match);

    function exec(line: LineOffset, rule: Rule): MatchingRule | undefined {
        const ctx = appendRule(rule, self);
        const match = regExec(line);
        if (!match) return undefined;
        ctx.match = match;
        return ctx as MatchingRule;
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
        endCapture: normalizeCapture(p.endCapture),
        repository,
        patterns,
        find: exec,
    };

    const regExec = makeExec(p.begin);

    function exec(line: LineOffset, context: Rule): MatchingRule | undefined {
        const ctx = appendRule(context, self);
        const match = regExec(line);
        if (!match) return undefined;
        ctx.match = match;
        return ctx as MatchingRule;
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
        find,
    };
    function find(line: LineOffset, rule: Rule): MatchingRule | undefined {
        const ctx = appendRule(rule, self);
        const input = line.line.slice(line.offset);
        const match = createSimpleMatchResult(input, input, line.offset);

        const r: MatchingRule = { ...ctx, match };
        return r;
    }
    return self;
}

function normalizePatternInclude(p: PatternInclude): NPatternInclude {
    const self: NPatternInclude = {
        ...p,
        find: find,
    };

    const include = p.include;

    if (!include.startsWith('#')) {
        throw new Error('External Imports not yet supported');
    }

    const ref = p.include.slice(1);

    function findRef(rule: Rule): NPattern {
        const pat = rule.repository[ref];
        if (pat === undefined) throw new Error(`Unknown Include Reference ${include}`);
        return pat;
    }

    function find(line: LineOffset, rule: Rule): MatchingRule | undefined {
        const pat = findRef(rule);
        const ctx = appendRule(rule, self);
        return pat.find(line, ctx);
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
        find,
    };

    function find(line: LineOffset, rule: Rule): MatchingRule | undefined {
        const patRule = appendRule(rule, self);
        return findInPatterns(self.patterns, line, patRule);
    }

    return self;
}

function findInPatterns(patterns: NPattern[], line: LineOffset, rule: Rule): MatchingRule | undefined {
    let r: MatchingRule | undefined = undefined;
    for (const pat of patterns) {
        const er = pat.find(line, rule);
        if (er?.match !== undefined) {
            r = (r && r.match && r.match.index < er.match.index && r) || er;
        }
    }
    return r;
}

function normalizePatternPatterns(p: { patterns: Pattern[] }): { patterns: NPattern[] };
function normalizePatternPatterns(p: { patterns: undefined }): { patterns: undefined };
function normalizePatternPatterns(p: { patterns?: Pattern[] }): { patterns?: NPattern[] };
function normalizePatternPatterns(p: { patterns?: Pattern[] }): { patterns?: NPattern[] } {
    const patterns = p.patterns ? normalizePatterns(p.patterns) : undefined;
    return { patterns };
}

function normalizePatterns(patterns: Pattern[]): NPattern[] {
    return patterns.map(nPattern);
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

function appendRule(parent: Rule, pattern: NPattern): Rule {
    const { repository, depth } = parent;
    const rep = !pattern.repository ? repository : Object.assign(Object.create(null), repository, pattern.repository);
    return {
        grammar: parent.grammar,
        pattern,
        parent,
        repository: rep,
        depth: depth + 1,
        match: undefined,
    };
}

function grammarToRule(grammar: NGrammar, pattern: NPatternPatterns): Rule {
    const depth = 0;
    const repository = Object.create(null);
    grammar.repository && Object.assign(repository, pattern.repository);
    repository['$self'] = pattern;
    return {
        grammar,
        pattern,
        parent: undefined,
        repository,
        depth,
        match: undefined,
    };
}

function normalizeCapture(cap: Capture | undefined): NCapture | undefined {
    if (cap === undefined) return undefined;
    if (typeof cap === 'string') return { [0]: cap };

    const capture: NCapture = Object.create(null);
    for (const [key, pat] of Object.entries(cap)) {
        capture[key] = typeof pat === 'string' ? pat : normalizePatternName(pat).name;
    }

    return capture;
}

function makeExec(reg: string | RegExp): (line: LineOffset) => MatchResult | undefined {
    if (typeof reg === 'string') return matchString(reg);
    return matchRegExp(reg);
}

function matchString(s: string): (line: LineOffset) => MatchResult | undefined {
    return (line) => {
        const input = line.line;
        const index = input.indexOf(s, line.offset);
        if (index < 0) return undefined;
        return createSimpleMatchResult(s, input, index);
    };
}

function matchRegExp(r: RegExp): (line: LineOffset) => MatchResult | undefined {
    return (line) => {
        const rg = RegExp(r, 'g');
        rg.lastIndex = line.offset;
        const m = rg.exec(line.line);
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
