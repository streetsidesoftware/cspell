import { grammar as grammarTS } from '../grammars/typescript';
import { LineOffset } from './grammarNormalized';
import { extractScope, normalizeGrammar } from './grammarNormalizer';

describe('grammarNormalizer', () => {
    test('normalizeGrammar', () => {
        const r = normalizeGrammar(grammarTS);
        expect(r).toBeDefined();
        expect(typeof r.find).toBe('function');
    });

    test.each`
        line                               | offset | expectedScope                               | expectedMatch
        ${''}                              | ${0}   | ${undefined}                                | ${undefined}
        ${"import * as p from 'path';\n"}  | ${0}   | ${['string.quoted.single.ts', 'source.ts']} | ${oc({ index: 19, matches: ["'"] })}
        ${`x = "a's" + 'b'; // comment\n`} | ${0}   | ${['string.quoted.double.ts', 'source.ts']} | ${oc({ index: 4, matches: ['"'] })}
        ${`x = "a's" + 'b'; // comment\n`} | ${9}   | ${['string.quoted.single.ts', 'source.ts']} | ${oc({ index: 12, matches: ["'"] })}
        ${`x = "a's" + 'b'; // comment\n`} | ${15}  | ${['comment.line.ts', 'source.ts']}         | ${oc({ index: 17, match: '// comment' })}
    `('normalizeGrammar.exec', ({ line, offset, expectedScope, expectedMatch }) => {
        const grammar = normalizeGrammar(grammarTS);
        const lineOff: LineOffset = { line, offset };
        const r = grammar.find(lineOff, undefined);
        const scope = r && extractScope(r);
        expect(scope).toEqual(expectedScope);
        expect(r?.match).toEqual(expectedMatch);
    });
});

function oc<T>(t: Partial<T>): T {
    return expect.objectContaining(t);
}
