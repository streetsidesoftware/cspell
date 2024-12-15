import Path from 'node:path';
import url, { fileURLToPath, pathToFileURL } from 'node:url';

import { describe, expect, test } from 'vitest';

import { pathWindowsDriveLetterToUpper } from './fileUrl.mjs';
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

    test.each`
        file                                   | relativeTo                             | path          | expected
        ${'.'}                                 | ${undefined}                           | ${undefined}  | ${pathToFileURL('./').href}
        ${'README.md'}                         | ${process.cwd()}                       | ${undefined}  | ${pathToFileURL('README.md').href}
        ${import.meta.url}                     | ${process.cwd()}                       | ${Path.win32} | ${import.meta.url}
        ${'deeper/'}                           | ${'file:///E:/user/Test/project/'}     | ${Path.win32} | ${'file:///E:/user/Test/project/deeper/'}
        ${'file://host/E$/user/test/project/'} | ${undefined}                           | ${Path.win32} | ${'file://host/E$/user/test/project/'}
        ${'../sibling'}                        | ${'file://host/E$/user/test/project/'} | ${Path.win32} | ${'file://host/E$/user/test/sibling'}
        ${fileURLToPath(import.meta.url)}      | ${'file://host/E$/user/test/project/'} | ${Path.win32} | ${import.meta.url}
    `('toFileURL $file $relativeTo', ({ file, relativeTo, path, expected }) => {
        const builder = new FileUrlBuilder({ path });
        const url = builder.toFileURL(file, relativeTo);
        expect(url.href).toBe(expected);
    });

    test.each`
        filePath                                  | path          | expected
        ${'.'}                                    | ${undefined}  | ${false}
        ${'./../hello'}                           | ${undefined}  | ${false}
        ${'src/README.md'}                        | ${undefined}  | ${false}
        ${'e:/path/to/file.txt'}                  | ${Path.win32} | ${true}
        ${'e:/path/to/file.txt'}                  | ${Path.posix} | ${false}
        ${'/path/to/file.txt'}                    | ${Path.win32} | ${true}
        ${'\\path\\to\\file.txt'}                 | ${Path.win32} | ${true}
        ${'\\path\\to\\file.txt'}                 | ${Path.posix} | ${false}
        ${'file:///E:/user/test/project/deeper/'} | ${Path.win32} | ${true}
        ${'vscode:///E:/user/test/project/'}      | ${Path.win32} | ${true}
    `('isAbsolute $filePath', ({ filePath, path, expected }) => {
        const builder = new FileUrlBuilder({ path });
        expect(builder.isAbsolute(filePath)).toEqual(expected);
    });

    test.each`
        filePath                                  | path          | expected
        ${'.'}                                    | ${undefined}  | ${false}
        ${'e:/path/to/file.txt'}                  | ${Path.win32} | ${false}
        ${'e:/path/to/file.txt'}                  | ${Path.posix} | ${false}
        ${'/path/to/file.txt'}                    | ${Path.win32} | ${false}
        ${'file:///E:/user/test/project/deeper/'} | ${Path.win32} | ${true}
        ${'vscode:///E:/user/test/project/'}      | ${Path.win32} | ${true}
    `('isUrlLike $filePath', ({ filePath, path, expected }) => {
        const builder = new FileUrlBuilder({ path });
        expect(builder.isUrlLike(filePath)).toEqual(expected);
    });

    test.each`
        filePath                                  | expected
        ${'.'}                                    | ${pathWindowsDriveLetterToUpper(process.cwd() + Path.sep)}
        ${'e:/path/to/file.txt'}                  | ${'E:/path/to/file.txt'.split('/').join(Path.sep)}
        ${'file:///e:/user/test/project/deeper/'} | ${'E:/user/test/project/deeper/'.split('/').join(Path.sep)}
        ${'vscode:///e:/user/test/project/'}      | ${'vscode:///e:/user/test/project/'}
    `('urlToFilePathOrHref $filePath', ({ filePath, expected }) => {
        const builder = new FileUrlBuilder();
        expect(builder.urlToFilePathOrHref(builder.toFileURL(filePath))).toEqual(expected);
    });
});
