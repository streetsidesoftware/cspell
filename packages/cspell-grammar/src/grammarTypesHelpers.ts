import {
    Pattern,
    PatternBeginEnd,
    PatternInclude,
    PatternMatch,
    PatternName,
    PatternPatterns,
} from './grammarDefinition';

export function isPatternInclude(p: Pattern): p is PatternInclude {
    if (!p || typeof p !== 'object') return false;
    return !!(<PatternInclude>p).include;
}

export function isPatternName(p: Pattern): p is PatternName {
    if (!p || typeof p !== 'object') return false;
    return !!p.name;
}

const TypeofMatch: Record<string, true> = {
    object: true,
    string: true,
};

const TypeofBegin = TypeofMatch;
const TypeofEnd = { ...TypeofBegin, undefined: true };

export function isPatternMatch(pattern: Pattern): pattern is PatternMatch {
    if (!pattern || typeof pattern !== 'object') return false;
    const p = <PatternMatch>pattern;
    return !!p.match && typeof p.match in TypeofMatch;
}

export function isPatternBeginEnd(pattern: Pattern): pattern is PatternBeginEnd {
    if (!pattern || typeof pattern !== 'object') return false;
    const p = <PatternBeginEnd>pattern;
    return !!p.begin && typeof p.begin in TypeofBegin && typeof p.end in TypeofEnd;
}

export function isPatternPatterns(p: Pattern): p is PatternPatterns {
    return Array.isArray(p.patterns);
}
