import { describe, expect, test } from 'vitest';

import {
    addTrailingSlash,
    basenameOfUrlPathname,
    isUrlLike,
    normalizeWindowsUrl,
    toURL,
    urlFilename,
    urlParent,
    urlRelative,
    urlRemoveFilename,
} from './url.mjs';

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
        ${'https://github.com/streetsidesoftware/cspell/README.md'}          | ${undefined}                                       | ${'https://github.com/streetsidesoftware/cspell/README.md'}
        ${'README.md'}                                                       | ${'https://github.com/streetsidesoftware/cspell/'} | ${'https://github.com/streetsidesoftware/cspell/README.md'}
        ${new URL('https://github.com/streetsidesoftware/cspell/README.md')} | ${undefined}                                       | ${'https://github.com/streetsidesoftware/cspell/README.md'}
        ${'vsls:/cspell.config.yaml'}                                        | ${undefined}                                       | ${'vsls:/cspell.config.yaml'}
        ${'stdin:sample.py'}                                                 | ${'file:///'}                                      | ${'stdin:sample.py'}
        ${'vsls:/cspell.config.yaml'}                                        | ${'file:///'}                                      | ${'vsls:/cspell.config.yaml'}
        ${'**/*.json'}                                                       | ${'file:///User/test/project/'}                    | ${'file:///User/test/project/**/*.json'}
        ${'**/*{.json,.jsonc,.yml}'}                                         | ${'file:///User/test/project/'}                    | ${'file:///User/test/project/**/*%7B.json,.jsonc,.yml%7D'}
    `('toUrl $url $rootUrl', ({ url, rootUrl, expected }) => {
        expect(toURL(url, rootUrl)).toEqual(new URL(expected));
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
    `('urlParent $url', ({ url, expected }) => {
        expect(urlParent(url).href).toEqual(new URL(expected).href);
    });

    test.each`
        url                                                           | expected
        ${'file:///'}                                                 | ${true}
        ${'file:///samples/cities.txt'}                               | ${true}
        ${'file:///samples/code/'}                                    | ${true}
        ${'stdin:sample.py'}                                          | ${true}
        ${'data:application/text'}                                    | ${true}
        ${'https://github.com/streetsidesoftware/samples/cities.txt'} | ${true}
        ${'vs-code:///remote/file/sample.ts'}                         | ${true}
    `('isUrlLike $url', ({ url, expected }) => {
        expect(isUrlLike(url)).toEqual(expected);
    });

    test.each`
        url                                                | expected
        ${'file:///'}                                      | ${'file:///'}
        ${'file:///samples/code/'}                         | ${'file:///samples/code/'}
        ${'file:///samples/code'}                          | ${'file:///samples/code/'}
        ${'stdin:sample'}                                  | ${'stdin:sample'}
        ${'stdin:/sample'}                                 | ${'stdin:/sample/'}
        ${'data:application/text'}                         | ${'data:application/text'}
        ${'https://github.com/streetsidesoftware/samples'} | ${'https://github.com/streetsidesoftware/samples/'}
        ${'vs-code:///remote/file/sample.ts'}              | ${'vs-code:///remote/file/sample.ts/'}
    `('addTrailingSlash $url', ({ url, expected }) => {
        expect(addTrailingSlash(toURL(url))).toEqual(new URL(expected));
    });

    test.each`
        urlFrom                                            | urlTo                                              | expected
        ${'file:///'}                                      | ${'file:///'}                                      | ${''}
        ${'file:///samples/code/'}                         | ${'file:///samples/code/src/file.cpp'}             | ${'src/file.cpp'}
        ${'file:///samples/code/package.json'}             | ${'file:///samples/code/src/file.cpp'}             | ${'src/file.cpp'}
        ${'file:///samples/code/'}                         | ${'file:///samples/code/'}                         | ${''}
        ${'file:///samples/code/'}                         | ${'file:///samples/code'}                          | ${'../code'}
        ${'file:///samples/code'}                          | ${'file:///samples/code/'}                         | ${'code/'}
        ${'stdin:sample'}                                  | ${'stdin:sample'}                                  | ${''}
        ${'stdin:/sample'}                                 | ${'stdin:/sample'}                                 | ${''}
        ${'data:application/text'}                         | ${'data:application/text'}                         | ${''}
        ${'https://github.com/streetsidesoftware/samples'} | ${'https://github.com/streetsidesoftware/samples'} | ${''}
        ${'vs-code:///remote/file/sample.ts'}              | ${'vs-code:///remote/file/sample.ts'}              | ${''}
    `('urlRelative $urlFrom $urlTo', ({ urlFrom, urlTo, expected }) => {
        expect(urlRelative(urlFrom, urlTo)).toEqual(expected);
        const rel = urlRelative(toURL(urlFrom), toURL(urlTo));
        expect(rel).toEqual(expected);
        if (toURL(urlFrom).pathname.startsWith('/')) {
            // new URL('', 'stdin:sample') will throw, but new URL('', 'stdin:/sample') will work.
            expect(new URL(rel, urlFrom)).toEqual(new URL(urlTo));
        }
    });

    test.each`
        url                              | expected
        ${'file:///path/to/my/file.txt'} | ${'file.txt'}
        ${'stdin:sample'}                | ${''}
    `('urlFilename $url', ({ url, expected }) => {
        url = new URL(url);
        expect(urlFilename(url)).toBe(expected);
    });

    test.each`
        url                              | expected
        ${'file:///path/to/my/file.txt'} | ${'file.txt'}
    `('urlFilename & urlRemoveFilename $url', ({ url, expected }) => {
        url = new URL(url);
        expect(urlFilename(url)).toBe(expected);
        expect(new URL(urlFilename(url), urlRemoveFilename(url)).href).toBe(url.href);
    });

    test.each`
        url                                   | expected
        ${'file:///path/to/my/file.txt'}      | ${'file:///path/to/my/file.txt'}
        ${'file:///C:/path/to/my/file.txt'}   | ${'file:///c:/path/to/my/file.txt'}
        ${'file:///C%3a/path/to/my/file.txt'} | ${'file:///c:/path/to/my/file.txt'}
        ${'file:///d:/path/to/my/file.txt'}   | ${'file:///d:/path/to/my/file.txt'}
        ${'file:///d%3a/path/to/my/file.txt'} | ${'file:///d:/path/to/my/file.txt'}
        ${'file:///d%3A/path/to/my/file.txt'} | ${'file:///d:/path/to/my/file.txt'}
    `('normalizeWindowsUrl  $url', ({ url, expected }) => {
        url = new URL(url);
        expect(normalizeWindowsUrl(url).href).toBe(expected);
    });
});
