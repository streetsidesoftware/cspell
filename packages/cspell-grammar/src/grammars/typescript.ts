import { Grammar, Repository } from '..';

const repository: Repository = {
    statements: {
        patterns: [{ include: '#string' }, { include: '#comment' }],
    },
    string: {
        patterns: [{ include: '#string_q_single' }, { include: '#string_q_double' }, { include: '#string_template' }],
    },
    string_q_single: {
        name: 'string.quoted.single.ts',
        begin: "'",
        end: /'|((?:[^\\\n])$)/,
        patterns: [{ include: '#string_character_escape' }],
    },
    string_q_double: {
        name: 'string.quoted.double.ts',
        begin: '"',
        end: /"|((?:[^\\\n])$)/,
        patterns: [{ include: '#string_character_escape' }],
    },
    string_template: {
        name: 'string.template.ts',
        begin: '`',
        end: '`',
        patterns: [{ include: '#string_character_escape' }],
    },
    string_wrap: {
        match: /(?:[^\\\n])$/,
    },
    string_character_escape: {
        name: 'constant.character.escape.js',
        match: /\\(x[0-9A-Fa-f]{2}|[0-3][0-7]{0,2}|[4-7][0-7]?|.|$)/,
    },
    comment: {
        patterns: [{ include: '#comment_line' }, { include: '#comment_block' }],
    },
    comment_line: {
        name: 'comment.line.ts',
        match: /\/\/.*/,
    },
    comment_block: {
        name: 'comment.block.ts',
        begin: '/*',
        end: '*/',
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
