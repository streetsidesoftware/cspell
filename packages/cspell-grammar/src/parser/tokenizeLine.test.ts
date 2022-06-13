import assert from 'assert';
import * as Simple from '../grammars/simple';
import { TypeScript } from '../grammars';
import { readFileSync } from 'fs';
import * as path from 'path';
import { normalizeGrammar } from './grammarNormalizer';
import { tokenizeText } from './tokenizeLine';
import type { TokenizedLine } from './types';

// const oc = expect.objectContaining;

const grammar = normalizeGrammar(Simple.grammar);
const grammarTypeScript = normalizeGrammar(TypeScript.grammar);

const sampleCode = readFileSync(path.join(__dirname, '../../samples/sampleJest.ts'), 'utf8');

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

    const sampleWithStrings = `
    const x = 'The auto\\'s left wheel.';
    function y(param = "first") {
        start = '('
        end = ")"
        msg = \`from \${start} to \${end} \`
    }
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
        ${t(sampleWithStrings, 'complex sample')}    | ${''}
    `('tokenizeText $test.name - $comment', ({ test }: { test: TextAndName }) => {
        expect.addSnapshotSerializer({
            test: isTokenizedLine,
            serialize: serializeTokenizedLine,
        });
        const r = tokenizeText(test.text, grammar);
        assertParsedLinesAreValid(r);
        expect(r).toMatchSnapshot();
    });

    const sampleTemplate = '\
msg = `\n\
${\n\
a + b // Join prefix and suffix\n\
}\n\
`;\
';

    const sampleTemplate2 = `
const sampleText = \`
    \${
        '.'.repeat(22) + // Comment
        { name: 'First' }.name
    }
\`;

describe('visualizeAsMD', () => {

`;

    test.each`
        test                                      | comment
        ${t('n = 42; // comment.')}               | ${''}
        ${t('n = 42; // comment.\n\n')}           | ${''}
        ${t('n = 42; // comment.\nq = n + 1;\n')} | ${''}
        ${t(sampleTemplate, 'sampleTemplate')}    | ${''}
        ${t(sampleTemplate2, 'sampleTemplate2')}  | ${''}
        ${t(sampleCode, 'sampleCode')}            | ${''}
    `('tokenizeText TypeScript $test.name - $comment', ({ test }: { test: TextAndName }) => {
        expect.addSnapshotSerializer({
            test: isTokenizedLine,
            serialize: serializeTokenizedLine,
        });
        const r = tokenizeText(test.text, grammarTypeScript);
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
    pLine.tokens.forEach((pt) => assert(text.startsWith(pt.text, pt.range[0])));
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
        `${t.range[0]}: ${JSON.stringify(t.text.replace(/\r/g, '↤').replace(/\n/g, '↩'))}`,
        `${t.scope.toString()}`,
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
