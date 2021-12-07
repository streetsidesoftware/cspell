/* eslint-disable no-useless-escape */
import { Grammar, Repository } from '..';

const repository: Repository = {
    frontMatter: { patterns: [] },
    block: { patterns: ['#raw'] },

    fenced_code_block: {
        patterns: ['#fenced_code_block_unknown'],
    },
    fenced_code_block_unknown: {
        name: 'markup.fenced_code.block.markdown',
        begin: /(^)(\s*)(`{3,}|~{3,})\s*(?=([^`~]*)?$)/,
        beginCaptures: {
            '3': 'punctuation.definition.markdown',
            '4': 'fenced_code.block.language',
        },
        // eslint-disable-next-line no-useless-backreference
        end: /(^|\G)(\2|\s{0,3})(\3)\s*$/,
        endCaptures: {
            '3': 'punctuation.definition.markdown',
        },
    },
    raw: {
        name: 'markup.inline.raw.string.markdown',
        captures: 'punctuation.definition.raw.markdown',
        begin: /`+/,
        end: '\\1',
    },
};

export const grammar: Grammar = {
    name: 'Markdown',
    scopeName: 'text.html.markdown',
    patterns: ['#frontMatter', '#block'],
    repository,
};
