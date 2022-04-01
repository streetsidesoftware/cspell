import { PatternRegExp } from './PatternRegExp';

describe('Pattern', () => {
    test.each`
        pattern      | expected
        ${/\b\w+/gi} | ${/\b\w+/gi}
        ${'.*'}      | ${/.*/}
    `('pattern $pattern', ({ pattern, expected }) => {
        const pat = new PatternRegExp(pattern);
        expect(JSON.stringify(pat)).toEqual(JSON.stringify(expected.toString()));
        expect(pat).toEqual(expected);
    });
});
