import { detectIndent } from './util';

describe('util', () => {
    test.each`
        content            | expected
        ${''}              | ${'  '}
        ${'{\n\t"name":'}  | ${'\t'}
        ${'{\n   "name":'} | ${'   '}
    `('detectIndent "$content"', ({ content, expected }) => {
        expect(detectIndent(content)).toBe(expected);
    });
});
