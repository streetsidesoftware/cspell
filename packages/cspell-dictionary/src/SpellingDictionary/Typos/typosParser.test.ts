import { parseTyposFile, createTypoDef } from './typosParser';

describe('TypoParser', () => {
    test.each`
        content                | expected
        ${''}                  | ${{}}
        ${'apple ->orange'}    | ${{ apple: 'orange' }}
        ${'apple ->'}          | ${{ apple: null }}
        ${'apple : , '}        | ${{ apple: null }}
        ${'a: b; c'}           | ${{ a: ['b', 'c'] }}
        ${'a->b , c'}          | ${{ a: ['b', 'c'] }}
        ${'a->b , c'}          | ${{ a: ['b', 'c'] }}
        ${'a->b , c\nb'}       | ${{ a: ['b', 'c'], b: null }}
        ${'a->b , c\nb\na->b'} | ${{ a: 'b', b: null }}
    `('parseTyposFile $content', ({ content, expected }) => {
        const result = parseTyposFile(content);
        expect(result).toEqual(expected);
    });

    test.each`
        entries              | expected
        ${[]}                | ${{}}
        ${['']}              | ${{}}
        ${[['', 'b']]}       | ${{}}
        ${['a']}             | ${{ a: null }}
        ${[['a']]}           | ${{ a: null }}
        ${[['a', 'b']]}      | ${{ a: 'b' }}
        ${[['a', 'b', 'c']]} | ${{ a: ['b', 'c'] }}
    `('parseTyposFile $entries', ({ entries, expected }) => {
        const result = createTypoDef(entries);
        expect(result).toEqual(expected);
    });
});
