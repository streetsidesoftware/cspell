import { strict as assert } from 'assert';
import { format } from 'util';
import { Grammar, Pattern, PatternList, Repository, PatternRef } from './grammarDefinition';
import { isPatternBeginEnd, isPatternInclude, isPatternMatch, isPatternPatterns } from './grammarTypesHelpers';

interface GrammarContext {
    grammar: Grammar;
    scopeExt: string;
}

export function validate(grammar: Grammar): asserts grammar {
    assert(grammar.scopeName);
    assert(/^[\w.]*\.\w+$/.test(grammar.scopeName));
    const scopeExt = '.' + grammar.scopeName.split('.').pop();
    const context = {
        grammar,
        scopeExt,
    };
    validatePatterns(grammar.patterns, context);
    validateGrammarRepository(grammar, context);
}

export function validatePatterns(patterns: PatternList, context: GrammarContext): asserts patterns {
    assert(Array.isArray(patterns));
    patterns.forEach((p) => validatePatternOrReference(p, context));
}

function validatePatternOrReference(pattern: Pattern | PatternRef, context: GrammarContext): asserts pattern {
    if (typeof pattern === 'string') {
        assert(/^\$self|\$base|#[\w-]+|[\w.]+$/.test(pattern));
    } else {
        validatePattern(pattern, context);
    }
}

export function validatePattern(pattern: Pattern, context: GrammarContext): asserts pattern {
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
    validatePatternName(pattern, context);
}

export function validateGrammarRepository(p: Grammar, context: GrammarContext): asserts p {
    p.repository && validateRepository(p.repository, context);
}

export function validateRepository(r: Repository, context: GrammarContext): asserts r {
    assert(typeof r === 'object');
    for (const [key, pat] of Object.entries(r)) {
        assert(/^[\w.-]+$/.test(key), 'Invalid Repository key, must be `a-zA-Z0-9`, `.`, `-`');
        validatePattern(pat, context);
    }
}

function validatePatternName(p: Pattern, context: GrammarContext): asserts p {
    assert(isValidPatternName(p.name), format('Invalid pattern name: %o', p));
    assert(
        p.name === undefined || p.name.endsWith(context.scopeExt),
        format(
            'Pattern name ending must match grammar scope ending. Grammar scope: "%s"; Pattern: %o',
            context.grammar.scopeName,
            p
        )
    );
}

function isValidPatternName(name: Pattern['name']): boolean {
    if (name === undefined) return true;
    if (typeof name !== 'string') return false;
    return /^[-\w.]+$/.test(name);
}
