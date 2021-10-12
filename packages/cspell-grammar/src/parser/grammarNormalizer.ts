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
    ExecContext,
    FindResult,
    LineOffset,
    MatchResult,
    NCapture,
    NGrammar,
    NPattern,
    NPatternBeginEnd,
    NPatternInclude,
    NPatternMatch,
    NPatternName,
    NPatternPatterns,
    NRepository,
} from './grammarNormalized';
import { isPatternBeginEnd, isPatternInclude, isPatternMatch, isPatternPatterns } from './grammarTypesHelpers';

export function normalizeGrammar(grammar: Grammar): NGrammar {
    const { scopeName, name, ...rest } = grammar;
    const pp = nPattern({ ...grammar, name: scopeName });
    const repository = pp.repository ?? {};
    pp.repository = repository;
    const g: NGrammar = {
        ...rest,
        scopeName,
        name,
        patterns: pp.patterns,
        repository,
        find: exec,
        toJSON,
    };
    repository['$self'] = g;

    function toJSON(this: NGrammar, key: string | number | undefined) {
        return key === '$self' ? undefined : this;
    }

    function exec(line: LineOffset, context: ExecContext | undefined): FindResult | undefined {
        const ctx = appendContext(context, g);
        return pp.find(line, ctx);
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

    function exec(line: LineOffset, context: ExecContext): FindResult | undefined {
        const ctx = appendContext(context, self);
        const match = regExec(line);
        if (!match) return;
        const r: FindResult = {
            match,
            line,
            context: ctx,
        };
        return r;
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

    function exec(line: LineOffset, context: ExecContext): FindResult | undefined {
        const ctx = appendContext(context, self);
        const match = regExec(line);
        if (!match) return;
        const r: FindResult = { match, line, context: ctx };
        return r;
    }

    return self;
}

function normalizePatternName(p: PatternName): NPatternName {
    const { repository } = normalizePatternRepository(p);
    const { patterns } = normalizePatternPatterns(p);
    const self: NPatternName = {
        ...p,
        repository,
        patterns,
        find: exec,
    };
    function exec(line: LineOffset, context: ExecContext): FindResult | undefined {
        const ctx = appendContext(context, self);
        const input = line.line.slice(line.offset);
        const match = createSimpleMatchResult(input, input, line.offset);

        const r: FindResult = { match, line, context: ctx };
        return r;
    }
    return self;
}

function normalizePatternInclude(p: PatternInclude): NPatternInclude {
    const self: NPatternInclude = {
        ...p,
        find: exec,
    };

    const include = p.include;

    if (!include.startsWith('#')) {
        throw new Error('External Imports not yet supported');
    }

    const ref = p.include.slice(1);

    function findRef(ctx: ExecContext): NPattern {
        const pat = ctx.repository[ref];
        if (pat === undefined) throw new Error(`Unknown Include Reference ${include}`);
        return pat;
    }

    function exec(line: LineOffset, context: ExecContext): FindResult | undefined {
        const pat = findRef(context);
        const ctx = appendContext(context, self);
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

    function find(line: LineOffset, context: ExecContext): FindResult | undefined {
        const ctx = appendContext(context, self);
        let r: FindResult | undefined = undefined;
        for (const pat of self.patterns) {
            const er = pat.find(line, ctx);
            if (er !== undefined) {
                r = (r && r.match.index < er.match.index && r) || er;
            }
        }
        return r;
    }

    return self;
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

function appendContext(context: ExecContext | undefined, pattern: NPattern): ExecContext {
    const { repository } = context || Object.create(null);
    const rep = !pattern.repository ? repository : Object.assign(Object.create(null), repository, pattern.repository);
    return {
        pattern,
        stack: context,
        repository: rep,
    };
}

function normalizeCapture(cap: Capture | undefined): NCapture | undefined {
    if (cap === undefined) return undefined;
    if (typeof cap === 'string') return { [0]: normalizePatternName({ name: cap }) };
    return normalizeRepository(cap);
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

function createMatchResult(r: RegExpExecArray): MatchResult {
    const match: MatchResult['match'] = Object.create(null);

    r.groups && Object.assign(match, r.groups);

    for (let i = 0; i < r.length; ++i) {
        const v = r[i];
        if (v !== undefined) match[i] = v;
    }

    return {
        index: r.index,
        input: r.input,
        match,
    };
}

function createSimpleMatchResult(match: string, input: string, index: number) {
    const groups: MatchResult['match'] = Object.create(null);
    groups[0] = match;
    return { index, input, match: groups };
}

export function execResultToScope(er: FindResult): string[] {
    const scope: string[] = [];

    for (let ctx: ExecContext | undefined = er.context; ctx; ctx = ctx.stack) {
        const name = ctx.pattern.name;
        if (name !== undefined) {
            scope.push(name);
        }
    }

    return scope;
}
