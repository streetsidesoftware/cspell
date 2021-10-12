import { grammar as grammarTS } from '../grammars/typescript';
import { LineOffset } from './grammarNormalized';
import { execResultToScope, normalizeGrammar } from './grammarNormalizer';

describe('grammarNormalizer', () => {
    test('normalizeGrammar', () => {
        const r = normalizeGrammar(grammarTS);
        expect(r).toBeDefined();
        expect(typeof r.find).toBe('function');
    });

    test.each`
        line                               | offset | expectedScope                               | expectedMatch
        ${''}                              | ${0}   | ${undefined}                                | ${undefined}
        ${"import * as p from 'path';\n"}  | ${0}   | ${['string.quoted.single.ts', 'source.ts']} | ${oc({ index: 19, match: { [0]: "'" } })}
        ${`x = "a's" + 'b'; // comment\n`} | ${0}   | ${['string.quoted.double.ts', 'source.ts']} | ${oc({ index: 4, match: { [0]: '"' } })}
        ${`x = "a's" + 'b'; // comment\n`} | ${9}   | ${['string.quoted.single.ts', 'source.ts']} | ${oc({ index: 12, match: { [0]: "'" } })}
        ${`x = "a's" + 'b'; // comment\n`} | ${15}  | ${['comment.line.ts', 'source.ts']}         | ${oc({ index: 17, match: { [0]: '// comment' } })}
    `('normalizeGrammar.exec', ({ line, offset, expectedScope, expectedMatch }) => {
        const grammar = normalizeGrammar(grammarTS);
        const lineOff: LineOffset = { line, offset };
        const r = grammar.find(lineOff, undefined);
        const scope = r && execResultToScope(r);
        expect(scope).toEqual(expectedScope);
        expect(r?.match).toEqual(expectedMatch);
    });
});

function oc<T>(t: Partial<T>): T {
    return expect.objectContaining(t);
}
