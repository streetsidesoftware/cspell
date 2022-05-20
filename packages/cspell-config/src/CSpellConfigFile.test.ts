import { parse, stringify } from 'comment-json';
import { __testing__ } from './CSpellConfigFile';

const { addUniqueWordsToListAndSort } = __testing__;

describe('CSpellConfigFile', () => {
    const listWithComments = '["one", // comment after\n "two",\n // comment before three\n "three"\n]';
    const listWithCommentsSorted = toStr(
        parse('["one", // comment after\n // comment before three\n "three",\n "two"]')
    );
    const listWithCommentsAddTen = toStr(
        parse('["one", // comment after\n "ten", \n // comment before three\n "three",\n "two"]')
    );
    test.each`
        list                | toAdd      | expected
        ${[]}               | ${[]}      | ${[]}
        ${listWithComments} | ${[]}      | ${listWithCommentsSorted}
        ${listWithComments} | ${['ten']} | ${listWithCommentsAddTen}
        ${listWithComments} | ${['two']} | ${listWithCommentsSorted}
    `('addUniqueWordsToListAndSort $list, $toAdd', ({ list, toAdd, expected }) => {
        list = typeof list === 'string' ? parse(list) : list;
        expected = typeof expected !== 'string' ? toStr(expected) : expected;
        addUniqueWordsToListAndSort(list, toAdd);
        expect(toStr(list)).toBe(expected);
    });
});

function toStr(obj: unknown): string {
    return stringify(obj, null, 2);
}
