import assert from 'assert';
import * as Simple from '../grammars/simple';
import { normalizeGrammar } from './grammarNormalizer';
import { tokenizeText } from './tokenizeLine';
import type { TokenizedLine } from './types';

// const oc = expect.objectContaining;

const grammar = normalizeGrammar(Simple.grammar);

interface TokenizeTest {
    name?: string;
    comment?: string;
    text: string;
    result: TokenizedLine[];
}

describe('tokenizeLine', () => {
    const tk: TokenizeTest[] = [
        { text: 'line # comment.', result: [] },
        { text: 'line # comment.\n', result: [] },
        { text: 'line ( a (b))', result: [] },
        { text: 'line ( a { b } c)', result: [] },
    ];

    test.each`
        text          | expected        | name                        | comment
        ${tk[0].text} | ${tk[0].result} | ${tk[0].name || tk[0].text} | ${tk[0].comment}
        ${tk[1].text} | ${tk[1].result} | ${tk[1].name || tk[1].text} | ${tk[1].comment}
        ${tk[2].text} | ${tk[2].result} | ${tk[2].name || tk[2].text} | ${tk[2].comment}
        ${tk[3].text} | ${tk[3].result} | ${tk[3].name || tk[3].text} | ${tk[3].comment}
    `('tokenizeText $name - $comment', ({ text }) => {
        expect.addSnapshotSerializer({
            test: isTokenizedLine,
            serialize: serializeTokenizedLine,
        });
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

function assertParsedLinesAreValid(lines: TokenizedLine[]): asserts lines {
    lines.forEach(assertParsedLineIsValid);
}

function assertParsedLineIsValid(pLine: TokenizedLine): asserts pLine {
    const text = pLine.line.text;
    const joined = pLine.tokens.map((pt) => pt.text).join('');
    assert(text === joined);
    pLine.tokens.forEach((pt) => assert(text.startsWith(pt.text, pt.offset)));
}

/**
 * Serialize a TokenizedLine for snapshots to improve diffs.
 * One line for the line and one line each for each segment
 */
function serializeTokenizedLine(
    val: TokenizedLine,
    _config: unknown,
    indentation: string,
    _depth: number,
    _refs: unknown
) {
    const { line, tokens: parsedText } = val;
    const pt = parsedText
        .map((t) => `${indentation}  ${t.offset}: ${JSON.stringify(t.text)} -- ${t.scope.join(' ')}`)
        .join('\n');
    return `${line.lineNumber}: ${JSON.stringify(line.text)}:\n${pt}`;
}

function isTokenizedLine(v: unknown | TokenizedLine): v is TokenizedLine {
    if (!v || typeof v !== 'object') return false;
    const tl = <TokenizedLine>v;
    return typeof tl.line === 'object' && Array.isArray(tl.tokens);
}
