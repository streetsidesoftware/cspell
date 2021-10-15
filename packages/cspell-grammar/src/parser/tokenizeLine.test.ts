import assert from 'assert';
import * as Simple from '../grammars/simple';
import { normalizeGrammar } from './grammarNormalizer';
import { ParsedLine } from './parser';
import { tokenizeText } from './tokenizeLine';

// const oc = expect.objectContaining;

const grammar = normalizeGrammar(Simple.grammar);

describe('tokenizeLine', () => {
    test.each`
        text
        ${'line ( a { b } c)'}
        ${'line # comment.'}
        ${'line # comment.\n'}
        ${'line ( a (b))'}
        ${'line ( a { b } c)'}
    `('tokenizeText $text', ({ text }) => {
        const r = tokenizeText(text, grammar);
        assertParsedLinesAreValid(r);
        expect(r).toMatchSnapshot();
    });
});

// function ocScope(...scope: string[]) {
//     return oc({ scope });
// }

// function ocScopes(...scopes: string[][]) {
//     return scopes.map((s) => ocScope(...s));
// }

// function ocParsedTextScopes(...scopes: string[][]) {
//     return oc({
//         parsedText: ocScopes(...scopes),
//     });
// }

function assertParsedLinesAreValid(lines: ParsedLine[]): asserts lines {
    lines.forEach(assertParsedLineIsValid);
}

function assertParsedLineIsValid(pLine: ParsedLine): asserts pLine {
    const text = pLine.line.text;
    const joined = pLine.parsedText.map((pt) => pt.text).join('');
    assert(text === joined);
    pLine.parsedText.forEach((pt) => assert(text.startsWith(pt.text, pt.offset)));
}
