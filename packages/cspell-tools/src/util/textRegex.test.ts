import { describe, expect, test } from 'vitest';

import { stringToRegExp } from './textRegex.js';

describe('Validate textRegex', () => {
    const examplePattern = `/
    ^                           # start of url
    https?:\\/\\/([^?#\n]*?)    # path
    (\\?[^#\n]*?)?              # query
    (\\#.*?)?                   # hash
    $                           # end of string
    /gmx`;

    test.each`
        pattern                            | expected
        ${''}                              | ${undefined}
        ${'/pat/gm'}                       | ${/pat/gm}
        ${' /pat/gm\n'}                    | ${/pat/gm}
        ${' /\npat # the pattern\n/gmx\n'} | ${/pat/gm}
        ${' /\npat # the pattern\n/gm\n'}  | ${/\npat # the pattern\n/gm}
        ${examplePattern}                  | ${/^https?:\/\/([^?#\n]*?)(\?[^#\n]*?)?(#.*?)?$/gm}
    `('stringToRegExp "$pattern"', ({ pattern, expected }) => {
        const r = stringToRegExp(pattern);
        expect(r).toEqual(expected);
    });
});
