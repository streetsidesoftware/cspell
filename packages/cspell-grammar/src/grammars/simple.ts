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
        patterns: [{ include: '#comment_line' }, { include: '#comment_block' }],
    },
    comment_line: {
        name: 'comment.line.s',
        match: /#.*/,
    },
    comment_block: {
        name: 'comment.block.s',
        disabled: true,
    },
};

export const grammar: Grammar = {
    name: 'Simple',
    scopeName: 'source.s',
    patterns: ['#statements'],
    repository,
};
