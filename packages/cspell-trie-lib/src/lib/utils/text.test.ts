import { expandCharacterSet, expandRange } from './text';

describe('text', () => {
    test.each`
        a           | b           | expected
        ${''}       | ${''}       | ${[]}
        ${'a'}      | ${'c'}      | ${['a', 'b', 'c']}
        ${'😁'}     | ${'😃'}     | ${['😁', '😂', '😃']}
        ${'\u0300'} | ${'\u0302'} | ${['\u0300', '\u0301', '\u0302']}
        ${'aa'}     | ${'ca'}     | ${['a', 'b', 'c']}
        ${'apple'}  | ${'cat'}    | ${['a', 'b', 'c']}
        ${'b'}      | ${'a'}      | ${[]}
        ${'b'}      | ${'b'}      | ${['b']}
    `('expandRange "$a" -> "$b"', ({ a, b, expected }) => {
        expect(expandRange(a, b)).toEqual(expected);
    });

    test.each`
        line          | expected
        ${''}         | ${[]}
        ${'a-c'}      | ${['a', 'b', 'c']}
        ${'😁-😃'}    | ${['😁', '😂', '😃']}
        ${'b'}        | ${['b']}
        ${'c-a'}      | ${['a', 'c']}
        ${'-c-a'}     | ${['a', 'c', '-']}
        ${'a-cA-CZ-'} | ${['a', 'b', 'c', 'A', 'B', 'C', 'Z', '-']}
    `('expandCharacterSet "$line"', ({ line, expected }) => {
        expect(expandCharacterSet(line)).toEqual(new Set(expected));
    });
});
