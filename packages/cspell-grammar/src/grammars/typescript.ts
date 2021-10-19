import { Grammar, Repository } from '..';

const repository: Repository = {
    statements: {
        name: 'code.ts',
        patterns: ['#string', '#comment', '#braces'],
    },
    string: {
        patterns: [{ include: '#string_q_single' }, { include: '#string_q_double' }, { include: '#string_template' }],
    },
    string_q_single: {
        name: 'string.quoted.single.ts',
        begin: "'",
        end: /'|((?:[^\\\n])$)/,
        captures: 'punctuation.string.ts',
        patterns: [{ include: '#string_character_escape' }],
    },
    string_q_double: {
        name: 'string.quoted.double.ts',
        begin: '"',
        end: /"|((?:[^\\\n])$)/,
        captures: 'punctuation.string.ts',
        patterns: [{ include: '#string_character_escape' }],
    },
    string_template: {
        name: 'string.template.ts',
        begin: '`',
        end: '`',
        captures: 'punctuation.string.ts',
        patterns: [
            {
                name: 'meta.template.expression.ts',
                contentName: 'meta.embedded.line.ts',
                begin: '${',
                end: '}',
                patterns: ['#statements'],
                captures: 'punctuation.definition.template.expression.ts',
            },
            { include: '#string_character_escape' },
        ],
    },
    string_character_escape: {
        name: 'constant.character.escape.ts',
        match: /\\(x[0-9A-Fa-f]{2}|[0-3][0-7]{0,2}|[4-7][0-7]?|.|$)/,
    },
    braces: {
        patterns: [
            {
                begin: '(',
                end: ')',
                captures: 'punctuation.meta.brace.ts',
                patterns: ['#statements'],
                contentName: 'meta.brace.ts',
            },
            {
                begin: '{',
                end: '}',
                captures: 'punctuation.meta.brace.ts',
                patterns: ['#statements'],
                contentName: 'meta.brace.ts',
            },
            {
                begin: '[',
                end: ']',
                captures: 'punctuation.meta.brace.ts',
                patterns: ['#statements'],
                contentName: 'meta.brace.ts',
            },
        ],
    },
    comment: {
        patterns: [
            {
                name: 'comment.line.ts',
                comment: 'line comment',
                begin: '//',
                end: /(?=$)/,
                captures: 'punctuation.definition.comment.ts',
            },
            {
                name: 'comment.block.documentation.ts',
                comment: 'DocBlock',
                begin: /\*\*(?!\/)/,
                captures: 'punctuation.definition.comment.ts',
                end: '*/',
            },
            {
                name: 'comment.block.ts',
                begin: '/*',
                end: '*/',
                captures: 'punctuation.definition.comment.ts',
            },
        ],
    },
};

export const grammar: Grammar = {
    name: 'TypeScript',
    scopeName: 'source.ts',
    patterns: [
        {
            name: 'comment.line.shebang.ts',
            match: /^#!.*(?=$)/,
        },
        {
            include: '#statements',
        },
    ],
    repository,
};
