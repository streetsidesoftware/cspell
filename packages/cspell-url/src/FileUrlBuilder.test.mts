import Path from 'node:path';
import url from 'node:url';

import { describe, expect, test } from 'vitest';

import { FileUrlBuilder } from './FileUrlBuilder.mjs';

describe('FileUrlBuilder', () => {
    test('FileUrlBuilder', () => {
        const builder = new FileUrlBuilder();
        expect(builder.cwd.href.toLowerCase()).toBe(url.pathToFileURL('./').href.toLowerCase());
        expect(builder.urlToFilePathOrHref(builder.cwd).toLowerCase()).toBe(Path.resolve('.').toLowerCase() + Path.sep);
    });

    test.each`
        fromPath                                  | toPath                                     | path          | expected
        ${'.'}                                    | ${'.'}                                     | ${undefined}  | ${''}
        ${'e:/path/to/file.txt'}                  | ${'e:/path/to/file2.txt'}                  | ${Path.win32} | ${'file2.txt'}
        ${'file:///E:/user/test/project/deeper/'} | ${'file:///E:/user/Test/project/'}         | ${Path.win32} | ${'../'}
        ${'file:///E:/user/test/project/'}        | ${'file:///E:/user/Test/project//deeper/'} | ${Path.win32} | ${'deeper/'}
    `('relative $fromPath $toPath', ({ fromPath, toPath, path, expected }) => {
        const builder = new FileUrlBuilder({ path });
        const fromUrl = builder.pathToFileURL(fromPath);
        const toUrl = builder.pathToFileURL(toPath);
        const result = builder.relative(fromUrl, toUrl);
        expect(result).toEqual(expected);
    });
});
