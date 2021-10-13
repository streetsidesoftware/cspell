import assert from 'assert';
import { Grammar } from '../grammarDefinition';
import { normalizeGrammar } from '../grammarNormalizer';
import { ParsedText } from '../parser';
import { applyCaptures } from './procMatchingRule';

const grammar: Grammar = {
    scopeName: 'source.tst',
    patterns: [
        {
            match: /([ \t]+)?((\/\/)(?:\s*((@)internal)(?=\s|$))?)(.*)/,
            captures: {
                '1': {
                    name: 'punctuation.whitespace.comment.leading.ts',
                },
                '2': {
                    name: 'comment.line.double-slash.ts',
                },
                '3': {
                    name: 'punctuation.definition.comment.ts',
                },
                '4': {
                    name: 'storage.type.internal-declaration.ts',
                },
                '5': {
                    name: 'punctuation.decorator.internal-declaration.ts',
                },
                '6': {
                    name: 'comment.line.double-slash.ts',
                },
            },
        },
        {
            match: /#.*/,
            captures: {
                '0': 'comment.line.hash.tst',
            },
        },
    ],
};

const sTest = {
    single_line_comment: {
        text: "const x = 'hello'; // a Comment.",
        offset: 0,
        expected: [
            s(['punctuation.whitespace.comment.leading.ts', 'source.tst']),
            s(['punctuation.definition.comment.ts', 'comment.line.double-slash.ts', 'source.tst']),
            s(['comment.line.double-slash.ts', 'source.tst']),
        ],
        comment: 'single_line_comment',
    },
};

describe('procMatchingRule', () => {
    test.each`
        text                                 | offset | expected                                        | comment
        ${"const x = 'hello'; # a Comment."} | ${0}   | ${[s(['comment.line.hash.tst', 'source.tst'])]} | ${''}
        ${sTest.single_line_comment.text}    | ${0}   | ${sTest.single_line_comment.expected}           | ${sTest.single_line_comment.comment}
    `('applyCaptures $text $comment', ({ text, offset, expected }) => {
        const m = match(text, offset);
        assert(m);
        expect(applyCaptures(m)).toEqual(expected);
    });
});

function s(scope: string[]): ParsedText {
    return oc<ParsedText>({ scope });
}

function match(text: string, offset = 0) {
    const g = normalizeGrammar(grammar);
    return g.find({ line: text, offset }, undefined);
}

function oc<T>(t: Partial<T>): T {
    return expect.objectContaining(t);
}
