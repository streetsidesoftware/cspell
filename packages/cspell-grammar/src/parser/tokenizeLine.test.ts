import assert from 'assert';
import * as Simple from '../grammars/simple';
import { normalizeGrammar } from './grammarNormalizer';
import { tokenizeText } from './tokenizeLine';
import type { TokenizedLine } from './types';

// const oc = expect.objectContaining;

const grammar = normalizeGrammar(Simple.grammar);

describe('tokenizeLine', () => {
    interface TextAndName {
        text: string;
        name: string;
    }

    const sampleNestedParen = `
(
    {
        {
            deep
        }
    }
)
`;

    function t(text: string, name?: string): TextAndName {
        return { text, name: name ?? JSON.stringify(text) };
    }

    test.each`
        test                                         | comment
        ${t('line # comment.')}                      | ${''}
        ${t('line # comment.\n')}                    | ${''}
        ${t('line ( a (b))')}                        | ${''}
        ${t('line ( a { b } c)')}                    | ${''}
        ${t(sampleNestedParen, 'sampleNestedParen')} | ${''}
    `('tokenizeText $test.name - $comment', ({ test }: { test: TextAndName }) => {
        expect.addSnapshotSerializer({
            test: isTokenizedLine,
            serialize: serializeTokenizedLine,
        });
        const r = tokenizeText(test.text, grammar);
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
    const textAndScope = parsedText.map((t) => [
        `${t.offset}: ${JSON.stringify(t.text.replace(/\r/g, '↤').replace(/\n/g, '↩'))}`,
        `${t.scope.join(' ')}`,
    ]);

    const maxLen = textAndScope.reduce((a, ts) => Math.max(a, ts[0].length), 0);

    const pt = textAndScope
        .map((ts) => `${indentation}  ${ts[0]}${' '.repeat(maxLen - ts[0].length)}     -- ${ts[1]}`)
        .join('\n');
    return `${line.lineNumber}: ${JSON.stringify(line.text.replace(/\r/g, '↤').replace(/\n/g, '↩'))}:\n${pt}`;
}

function isTokenizedLine(v: unknown | TokenizedLine): v is TokenizedLine {
    if (!v || typeof v !== 'object') return false;
    const tl = <TokenizedLine>v;
    return typeof tl.line === 'object' && Array.isArray(tl.tokens);
}
