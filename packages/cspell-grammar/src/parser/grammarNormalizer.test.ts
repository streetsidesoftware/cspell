import { describe, expect, test } from 'vitest';

import { grammar as grammarTS } from '../grammars/typescript.js';
import { extractScope, normalizeGrammar } from './grammarNormalizer.js';
import { ScopePool } from './scope.js';
import type { LineOffsetAnchored } from './types.js';

const scopePool = new ScopePool();

describe('grammarNormalizer', () => {
    test('normalizeGrammar', () => {
        const r = normalizeGrammar(grammarTS);
        expect(r).toBeDefined();
        expect(typeof r.begin).toBe('function');
    });

    test.each`
        line                               | offset | expectedScope                                          | expectedMatch
        ${''}                              | ${0}   | ${undefined}                                           | ${undefined}
        ${"import * as p from 'path';\n"}  | ${19}  | ${['string.quoted.single.ts', 'code.ts', 'source.ts']} | ${oc({ index: 19, matches: ["'"] })}
        ${`x = "a's" + 'b'; // comment\n`} | ${4}   | ${['string.quoted.double.ts', 'code.ts', 'source.ts']} | ${oc({ index: 4, matches: ['"'] })}
        ${`x = "a's" + 'b'; // comment\n`} | ${12}  | ${['string.quoted.single.ts', 'code.ts', 'source.ts']} | ${oc({ index: 12, matches: ["'"] })}
        ${`x = "a's" + 'b'; // comment\n`} | ${17}  | ${['comment.line.ts', 'code.ts', 'source.ts']}         | ${oc({ index: 17, match: '//' })}
    `('normalizeGrammar.exec $line $offset', ({ line, offset, expectedScope, expectedMatch }) => {
        const grammar = normalizeGrammar(grammarTS);
        const lineOff: LineOffsetAnchored = { text: line, offset, lineNumber: 5, anchor: -1 };
        const rule = grammar.begin(undefined);
        const m = rule.findNext(lineOff);
        const scope = m && extractScope(m.rule);
        expect(scope).toEqual(expectedScope && scopePool.parseScope(expectedScope));
        expect(m?.match).toEqual(expectedMatch);
    });
});

function oc<T>(t: Partial<T>): T {
    return expect.objectContaining(t);
}
