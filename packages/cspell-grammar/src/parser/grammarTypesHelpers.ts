import type {
    GrammarDef,
    Pattern,
    PatternBeginEnd,
    PatternInclude,
    PatternMatch,
    PatternPatterns,
} from './grammarDefinition';

export function isPatternInclude(p: Pattern): p is PatternInclude {
    return !!(<PatternInclude>p).include;
}

const TypeofMatch: Record<string, true> = {
    object: true,
    string: true,
};

const TypeofBegin = TypeofMatch;
const TypeofEnd = { ...TypeofBegin, undefined: true };

export function isPatternMatch(pattern: Pattern): pattern is PatternMatch {
    const p = <PatternMatch>pattern;
    return !!p.match && typeof p.match in TypeofMatch;
}

export function isPatternBeginEnd(pattern: Pattern): pattern is PatternBeginEnd {
    const p = <PatternBeginEnd>pattern;
    return p.begin !== undefined && typeof p.begin in TypeofBegin && typeof p.end in TypeofEnd;
}

export function isPatternPatterns(p: Pattern): p is PatternPatterns {
    return Array.isArray(p.patterns);
}

export function isGrammar(g: GrammarDef | Pattern): g is GrammarDef {
    return (<GrammarDef>g).scopeName !== undefined;
}
