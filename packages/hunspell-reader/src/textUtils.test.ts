import { removeAccents, removeLooseAccents, toRange, toUnicodeCode } from './textUtils';

describe('textUtils', () => {
    test.each`
        text                       | expected
        ${'abc'}                   | ${'abc'}
        ${'café'}                  | ${'caf\\u00e9'}
        ${'café'.normalize('NFD')} | ${'cafe\\u0301'}
        ${'abc\nabc'}              | ${'abc\\u000aabc'}
    `('toUnicodeCode $text', ({ text, expected }) => {
        const result = toUnicodeCode(text);
        expect(result).toBe(expected);
        const json = `"${result}"`;
        expect(JSON.parse(json)).toBe(text);
    });

    test.each`
        text                                      | minLength    | expected
        ${''}                                     | ${undefined} | ${''}
        ${'abc'}                                  | ${undefined} | ${'abc'}
        ${'abc'}                                  | ${1}         | ${'a-c'}
        ${'abc'}                                  | ${3}         | ${'a-c'}
        ${'abcd'}                                 | ${undefined} | ${'a-d'}
        ${'abcdefg'}                              | ${undefined} | ${'a-g'}
        ${'abcdefg'}                              | ${7}         | ${'a-g'}
        ${'abcdefg'}                              | ${8}         | ${'abcdefg'}
        ${'abcd.abcdef.gh'}                       | ${undefined} | ${'a-d.a-f.gh'}
        ${'café'}                                 | ${undefined} | ${'café'}
        ${'\u0300\u0300\u0301\u0302\u0303\u0308'} | ${undefined} | ${'\u0300\u0300-\u0303\u0308'}
    `('toRange $text', ({ text, minLength, expected }) => {
        const result = toRange(text, minLength);
        expect(result).toBe(expected);
    });

    test.each`
        text                       | expected
        ${'abc'}                   | ${'abc'}
        ${'café'}                  | ${'cafe'}
        ${'café'.normalize('NFD')} | ${'cafe'}
        ${'café café'}             | ${'cafe cafe'}
    `('removeAccents $text', ({ text, expected }) => {
        expect(removeAccents(text)).toBe(expected);
    });

    test.each`
        text                             | expected
        ${'abc'}                         | ${'abc'}
        ${'café'}                        | ${'café'}
        ${'café'.normalize('NFD')}       | ${'cafe'}
        ${'café cafe\u0300'}             | ${'café cafe'}
        ${'cafe\u0301'.normalize('NFC')} | ${'café'}
    `('removeLooseAccents $text', ({ text, expected }) => {
        expect(removeLooseAccents(text)).toBe(expected);
    });
});
