import { describe, expect, test } from 'vitest';

import { basenameOfUrlPathname, isUrlLike, toURL, urlParent } from './url.mjs';

describe('url', () => {
    test.each`
        file                                                                                                | expected
        ${'samples/cities.txt'}                                                                             | ${false}
        ${'samples/cities.txt.gz'}                                                                          | ${false}
        ${'https://github.com/streetsidesoftware/cspell/raw/main/packages/cspell-io/samples/cities.txt'}    | ${true}
        ${'https://github.com/streetsidesoftware/cspell/raw/main/packages/cspell-io/samples/cities.txt.gz'} | ${true}
        ${'vsls:/cspell.config.yaml'}                                                                       | ${true}
    `('isUrlLike $file', ({ file, expected }) => {
        expect(isUrlLike(file)).toBe(expected);
    });

    test.each`
        url                                                                  | rootUrl                                            | expected
        ${'https://github.com/streetsidesoftware/cspell/README.md'}          | ${undefined}                                       | ${new URL('https://github.com/streetsidesoftware/cspell/README.md')}
        ${'README.md'}                                                       | ${'https://github.com/streetsidesoftware/cspell/'} | ${new URL('https://github.com/streetsidesoftware/cspell/README.md')}
        ${new URL('https://github.com/streetsidesoftware/cspell/README.md')} | ${undefined}                                       | ${new URL('https://github.com/streetsidesoftware/cspell/README.md')}
        ${'vsls:/cspell.config.yaml'}                                        | ${undefined}                                       | ${new URL('vsls:/cspell.config.yaml')}
        ${'vsls:/cspell.config.yaml'}                                        | ${'file:///'}                                      | ${new URL('vsls:/cspell.config.yaml')}
    `('toUrl $url $rootUrl', ({ url, rootUrl, expected }) => {
        expect(toURL(url, rootUrl)).toEqual(expected);
    });

    test.each`
        file                                                                                                | expected
        ${'/'}                                                                                              | ${''}
        ${'samples/cities.txt'}                                                                             | ${'cities.txt'}
        ${'samples/cities.txt.gz'}                                                                          | ${'cities.txt.gz'}
        ${'samples/code/'}                                                                                  | ${'code/'}
        ${'file://samples/code/'}                                                                           | ${'code/'}
        ${'https://github.com/streetsidesoftware/cspell/raw/main/packages/cspell-io/samples/cities.txt'}    | ${'cities.txt'}
        ${'https://github.com/streetsidesoftware/cspell/raw/main/packages/cspell-io/samples/cities.txt.gz'} | ${'cities.txt.gz'}
        ${'https://github.com/streetsidesoftware/cspell/raw/main/packages/cspell-io/samples/code/'}         | ${'code/'}
    `('basename $file', async ({ file, expected }) => {
        expect(basenameOfUrlPathname(file)).toEqual(expected);
    });

    test.each`
        url                                                           | expected
        ${'file:///'}                                                 | ${'file:///'}
        ${'file:///samples/cities.txt'}                               | ${'file:///samples/'}
        ${'file:///samples/code/'}                                    | ${'file:///samples/'}
        ${'https://github.com/streetsidesoftware/samples/cities.txt'} | ${'https://github.com/streetsidesoftware/samples/'}
        ${'stdin:/github.com/streetsidesoftware/samples/'}            | ${'stdin:/github.com/streetsidesoftware/'}
        ${'stdin:github.com/streetsidesoftware/samples/'}             | ${'stdin:github.com/streetsidesoftware/'}
        ${'vsls:/cspell.config.yaml'}                                 | ${'vsls:/'}
        ${'vsls:/path/file.txt'}                                      | ${'vsls:/path/'}
    `('urlParent $url', async ({ url, expected }) => {
        expect(urlParent(url)).toEqual(new URL(expected));
    });
});
