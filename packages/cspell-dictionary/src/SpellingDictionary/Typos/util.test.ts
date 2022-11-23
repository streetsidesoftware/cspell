import { appendToDef, createTyposDef, extractAllSuggestions, extractIgnoreValues } from './util';

describe('typos/util', () => {
    test.each`
        def                     | entry              | expected
        ${{}}                   | ${''}              | ${{}}
        ${{ a: 'b' }}           | ${'a'}             | ${{ a: null }}
        ${{}}                   | ${['a']}           | ${{ a: null }}
        ${{}}                   | ${['a', 'b']}      | ${{ a: 'b' }}
        ${{}}                   | ${['a', 'b', 'c']} | ${{ a: ['b', 'c'] }}
        ${{ a: 'aa', b: 'bb' }} | ${{ a: 'aaa' }}    | ${{ a: 'aaa', b: 'bb' }}
    `('appendToDef', ({ def, entry, expected }) => {
        expect(appendToDef(def, entry)).toEqual(expected);
    });

    test.each`
        entries                | expected
        ${[]}                  | ${{}}
        ${undefined}           | ${{}}
        ${[['a', null]]}       | ${{ a: null }}
        ${[['a', 'b']]}        | ${{ a: 'b' }}
        ${[['a', ['b']]]}      | ${{ a: ['b'] }}
        ${[['a', ['b', 'c']]]} | ${{ a: ['b', 'c'] }}
    `('parseTyposFile $entries', ({ entries, expected }) => {
        const result = createTyposDef(entries);
        expect(result).toEqual(expected);
    });

    test.each`
        typos                                                  | expected
        ${{}}                                                  | ${[]}
        ${{ a: null, b: undefined, c: 'cc', d: ['dd', 'ee'] }} | ${['cc', 'dd', 'ee']}
    `('extractAllSuggestions $typos', ({ typos, expected }) => {
        const r = extractAllSuggestions(typos);
        expect(r).toEqual(new Set(expected));
    });

    test.each`
        typos                                                   | expected
        ${{}}                                                   | ${[]}
        ${{ a: null, b: undefined, c: 'cc', d: ['dd', 'ee'] }}  | ${[]}
        ${{ '!a': null, '!b': null, c: 'cc', d: ['dd', 'ee'] }} | ${['a', 'b']}
    `('extractIgnoreValues $typos', ({ typos, expected }) => {
        const r = extractIgnoreValues(typos, '!');
        expect(r).toEqual(new Set(expected));
    });
});
