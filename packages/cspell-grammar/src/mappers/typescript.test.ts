import { mapRawString } from './typescript';

describe('mappers typescript', () => {
    test.each`
        text                    | expected
        ${''}                   | ${''}
        ${'hello'}              | ${'hello'}
        ${'hello\\x20there'}    | ${'hello\x20there'}
        ${'hello\\u0020there'}  | ${'hello\u0020there'}
        ${'hello\\u{020}there'} | ${'hello\u{020}there'}
        ${'a\\tb'}              | ${'a\tb'}
        ${'a\\rb'}              | ${'a\rb'}
        ${'a\\nb'}              | ${'a\nb'}
        ${'a\\dd'}              | ${'add'}
        ${'a\\x'}               | ${'ax'}
        ${'a\\xy'}              | ${'axy'}
        ${'a\\x9h'}             | ${'ax9h'}
        ${'a\\u9h'}             | ${'au9h'}
        ${'a\\u{9h}'}           | ${'au{9h}'}
    `('mapRawString $# [$text]', ({ text, expected }) => {
        const r = mapRawString(text);
        expect(toCharCodes(r.text)).toBe(toCharCodes(expected));
        expect(r.text).toBe(expected);
    });

    test.each`
        text                    | expected
        ${''}                   | ${[]}
        ${'hello'}              | ${[]}
        ${'hello\\x20there'}    | ${[5, 5, 9, 6, 14, 11]}
        ${'hello\\u0020there'}  | ${[5, 5, 11, 6, 16, 11]}
        ${'hello\\u{020}there'} | ${[5, 5, 12, 6, 17, 11]}
    `('mapRawString map $# [$text]', ({ text, expected }) => {
        const r = mapRawString(text);
        expect(r.map).toEqual(expected);
    });
});

function toCharCodes(s: string): string {
    return s
        .split('')
        .map((a) => ('000' + a.charCodeAt(0).toString(16)).slice(-4))
        .join(', ');
}
