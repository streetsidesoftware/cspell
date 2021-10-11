import { Grammar, Repository } from '../grammarDefinition';

const repository: Repository = {
    statements: {
        patterns: [{ include: '#string' }],
    },
    string: {
        patterns: [{ include: '#string_q_single' }],
    },
    string_q_single: {
        name: 'string.quoted.single.ts',
        begin: "'",
        end: "'",
        patterns: [{ include: '#string_wrap' }],
    },
    string_q_double: {
        name: 'string.quoted.double.ts',
        begin: '"',
        end: '"',
        patterns: [{ include: '#string_wrap' }],
    },
    string_template: {
        name: 'string.template.ts',
        begin: '`',
        end: '`',
    },
    string_wrap: {
        match: /(?:[^\\\n])$/,
    },
};

export const grammar: Grammar = {
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
