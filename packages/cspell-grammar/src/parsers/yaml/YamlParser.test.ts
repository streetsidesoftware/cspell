import { describe, expect, test } from 'vitest';
import { CST, Lexer } from 'yaml';

import { parser } from './YamlParser.js';

// cspell:ignore doesn

describe('YAML parser', () => {
    test('normalizes only single-quoted scalars and preserves line breaks', () => {
        const source = [
            "plain: doesn't",
            `double: "doesn''t"`,
            "comment: yes # 'doesn''t'",
            'block: |',
            "  'doesn''t'",
            "flow: {'it doesn''t': 'isn''t'}",
            "multiline: 'It doesn''t",
            "  work when it isn''t ready.'",
            '',
            "empty: ''",
            "apostrophe: ''''",
        ].join('\r\n');
        const lines = [...parser.parse(source, 'sample.yaml').parsedTexts];

        expect(lines.map(({ text }) => text).join('')).toBe(
            source
                .replace("flow: {'it doesn''t': 'isn''t'}", "flow: {'it doesn't': 'isn't'}")
                .replace("multiline: 'It doesn''t", "multiline: 'It doesn't")
                .replace("work when it isn''t", "work when it isn't")
                .replace("apostrophe: ''''", "apostrophe: '''"),
        );
        expect(lines.map(({ range: [start, end] }) => source.slice(start, end)).join('')).toBe(source);
    });
});

describe('Validate yaml assumptions', () => {
    test('the lexer distinguishes quoted scalars from plain and block scalar payloads', () => {
        const source = "\uFEFF---\r\nblock: |\r\n  'doesn''t'\r\nvalue: 'it doesn''t' # comment\r\n";
        const tokens = [...new Lexer().lex(source)];

        expect(tokens).toContain(CST.DOCUMENT);
        expect(tokens.slice(tokens.indexOf(CST.SCALAR), tokens.indexOf(CST.SCALAR) + 2)).toEqual([CST.SCALAR, 'block']);
        expect(tokens).toContain("  'doesn''t'\r\n");
        expect(tokens).toContain("'it doesn''t'");
        expect(tokens.filter((token) => ![CST.DOCUMENT, CST.FLOW_END, CST.SCALAR].includes(token)).join('')).toBe(
            source,
        );
    });
});
