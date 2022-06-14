import { GrammarDef, Repository } from '..';

const repository: Repository = {
    statements: {
        name: 'code.ts',
        patterns: [
            '#keyword',
            '#string',
            '#comment',
            '#braces',
            '#punctuation',
            '#space',
            { name: 'identifier', match: /[^\s;,!|&:^%{}[\]()*/+=<>]+/ },
        ],
    },
    keyword: {
        patterns: ['#keywordBase', '#standardTypes', '#standardLib'],
    },
    keywordBase: {
        name: 'keyword.typescript.ts',
        match: /\b(?:any|as|async|await|bigint|boolean|break|case|catch|const|continue|do|else|enum|export|extends|false|finally|for|from|function|get|if|implements|in|instanceof|interface|import|let|map|module|new|new|null|number|of|package|private|public|require|return|set|static|string|super|switch|this|throw|true|try|type|typeof|unknown|undefined|var|void|while|yield)\b/,
    },
    standardTypes: {
        name: 'keyword.type.ts',
        match: /\b(?:Promise|Record|Omit|Extract|Exclude|BigInt|Array)\b/,
    },
    standardLib: {
        name: 'keyword.lib.ts',
        match: /\b(?:console|process|window)\b/,
    },
    string: {
        patterns: ['#string_q_single', '#string_q_double', '#string_template'],
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
        match: /\\(x[0-9A-Fa-f]{2}|[0-3][0-7]{0,2}|[4-7][0-7]?|u[0-9A-Fa-f]{4}|.|\r?\n?$)/,
    },
    braces: {
        patterns: [
            {
                begin: '(',
                end: ')',
                captures: 'punctuation.meta.brace.ts',
                patterns: ['#statements'],
                name: 'meta.brace.ts',
                contentName: 'code.ts',
            },
            {
                begin: '{',
                end: '}',
                captures: 'punctuation.meta.brace.ts',
                patterns: ['#statements'],
                name: 'meta.brace.ts',
                contentName: 'code.ts',
            },
            {
                begin: '[',
                end: ']',
                captures: 'punctuation.meta.brace.ts',
                patterns: ['#statements'],
                name: 'meta.brace.ts',
                contentName: 'code.ts',
            },
        ],
    },
    punctuation: {
        name: 'punctuation.ts',
        match: /[-;:,!|&^%*/+=<>\n\r]/,
    },
    space: {
        name: 'punctuation.space.ts',
        match: /\s+/,
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
                begin: /\/\*\*(?!\/)/,
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

export const grammar: GrammarDef = {
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
