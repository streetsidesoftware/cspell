/* eslint-disable no-useless-escape */
import { Grammar, Repository } from '..';

const repository: Repository = {
    statements: {
        patterns: ['#braces', '#comment'],
    },
    braces: {
        name: 'braces.s',
        patterns: ['#braces_paren', '#braces_curly'],
    },
    braces_paren: {
        captures: 'paren.braces.s',
        contentName: 'content.braces.s',
        begin: '(',
        end: ')',
        patterns: ['$self'],
    },
    braces_curly: {
        captures: 'curly.braces.s',
        contentName: 'content.braces.s',
        begin: '{',
        end: '}',
        patterns: ['$self'],
    },
    comment: {
        patterns: ['#comment_line', '#comment_doc_block', '#comment_block'],
    },
    comment_line: {
        patterns: ['#comment_line_double_slash', '#comment_line_hash'],
    },
    comment_line_hash: {
        name: 'comment.line.s',
        match: /#.*\s?/,
    },
    comment_line_double_slash: {
        name: 'comment.line.s',
        match: /\/\/.*\s?/,
    },
    comment_doc_block: {
        name: 'comment.block.s',
        begin: '/**',
        end: '*/',
    },
    comment_block: {
        name: 'comment.block.s',
        begin: '/*',
        end: '*/',
    },
    string: {
        patterns: [{ include: '#string_q_single' }, { include: '#string_q_double' }, { include: '#string_template' }],
    },
    string_q_single: {
        name: 'string.quoted.single.s',
        begin: "'",
        end: /'|((?:[^\\\n])$)/,
        patterns: [{ include: '#string_character_escape' }],
    },
    string_q_double: {
        name: 'string.quoted.double.s',
        begin: '"',
        end: /"|((?:[^\\\n])$)/,
        patterns: [{ include: '#string_character_escape' }],
    },
    string_template: {
        name: 'string.template.s',
        begin: '`',
        end: '`',
        patterns: [{ include: '#string_character_escape' }, '#template_embedded'],
    },
    string_wrap: {
        match: /(?:[^\\\n])$/,
    },
    string_character_escape: {
        name: 'constant.character.escape.s',
        match: /\\(x[0-9A-Fa-f]{2}|[0-3][0-7]{0,2}|[4-7][0-7]?|.|$)/,
    },
    template_embedded: {
        name: 'embedded.template.s',
        begin: '${',
        end: '}',
        patterns: ['#statement'],
    },
};

export const grammar: Grammar = {
    name: 'Simple',
    scopeName: 'source.s',
    patterns: ['#statements'],
    repository,
};
