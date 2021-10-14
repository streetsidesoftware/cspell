import { strict as assert } from 'assert';
import { format } from 'util';
import { Grammar, Pattern, PatternList, Repository, PatternRef } from './grammarDefinition';
import { isPatternBeginEnd, isPatternInclude, isPatternMatch, isPatternPatterns } from './grammarTypesHelpers';

export function validate(grammar: Grammar): asserts grammar {
    assert(grammar.scopeName);
    assert(/^[\w.]+$/.test(grammar.scopeName));
    validatePatterns(grammar.patterns);
    validatePatternRepository(grammar);
}

export function validatePatterns(patterns: PatternList): asserts patterns {
    assert(Array.isArray(patterns));
    patterns.forEach(validatePatternOrReference);
}

function validatePatternOrReference(pattern: Pattern | PatternRef): asserts pattern {
    if (typeof pattern === 'string') {
        assert(/^\$self|\$base|#[\w-]+|[\w.]+$/.test(pattern));
    } else {
        validatePattern(pattern);
    }
}

export function validatePattern(pattern: Pattern): asserts pattern {
    assert(
        isPatternMatch(pattern) ||
            isPatternBeginEnd(pattern) ||
            isPatternInclude(pattern) ||
            isPatternPatterns(pattern),
        format('Unknown Pattern: %o', pattern)
    );
    assert(
        !(isPatternBeginEnd(pattern) && isPatternMatch(pattern)),
        format('Pattern must be a Match pattern or a Begin/End pattern, but not both: %o', pattern)
    );
    validatePatternName(pattern);
    validatePatternRepository(pattern);
}

export function validatePatternRepository(p: Pattern | Grammar): asserts p {
    p.repository && validateRepository(p.repository);
}

export function validateRepository(r: Repository): asserts r {
    assert(typeof r === 'object');
    for (const [key, pat] of Object.entries(r)) {
        assert(/^[\w.-]+$/.test(key), 'Invalid Repository key, must be `a-zA-Z0-9`, `.`, `-`');
        validatePattern(pat);
    }
}

function validatePatternName(p: Pattern): asserts p {
    assert(isValidPatternName(p.name), format('Invalid pattern name: %o', p));
}

function isValidPatternName(name: Pattern['name']): boolean {
    if (name === undefined) return true;
    if (typeof name !== 'string') return false;
    return /^[-\w.]+$/.test(name);
}
