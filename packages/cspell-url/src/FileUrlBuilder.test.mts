import Path from 'node:path';
import url, { fileURLToPath, pathToFileURL } from 'node:url';

import { describe, expect, test } from 'vitest';

import { addLongPathPrefix, addLongPathPrefixAlt, pathWindowsDriveLetterToUpper } from './fileUrl.mts';
import type { ParsedPath } from './FileUrlBuilder.mts';
import { FileUrlBuilder } from './FileUrlBuilder.mts';

const thisFilePath = fileURLToPath(import.meta.url);

const packageRootUrl = new URL('../', import.meta.url);
const packageRoot = fileURLToPath(packageRootUrl);
const fixtureLongPath = 'fixtures/unc-long-path/learn.microsoft.com/en-us/dotnet/standard/io/file-path-formats';
const longFilename209 = `\
very-long-filename-to-test-url-handling-in-cspell-io-and-cspell-url-utilities-for-long-paths-on-windows-to-ensure-\
that-these-tools-can-handle-long-paths-on-windows-without-issues-it-is-209-characters-long.txt\
`;
// https://github.com/streetsidesoftware/vscode-spell-checker/issues/4978
const longFilenameIssue4978 = `\
Engineering/Programming/Aerials/LCS Y2020/y2020_controller/local_builds/2512/251216/RNE_Aerial_Dev/162221_5cf5637b6_cmorris\
/23461B-001_ID025_Aux_Control_Platform_Leveling_Y2020_TTC2310/23461B-001_ID025_Aux_Control_Platform_Leveling_Y2020_TTC2310_controller.log\
`;

// cspell:ignore cmorris

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
        filePath                                                             | expected
        ${'.'}                                                               | ${pathWindowsDriveLetterToUpper(process.cwd() + Path.sep)}
        ${'e:/path/to/file.txt'}                                             | ${'E:/path/to/file.txt'.split('/').join(Path.sep)}
        ${'file:///e:/user/test/project/deeper/'}                            | ${'E:/user/test/project/deeper/'.split('/').join(Path.sep)}
        ${'vscode:///e:/user/test/project/'}                                 | ${'vscode:///e:/user/test/project/'}
        ${Path.resolve(packageRoot, fixtureLongPath, longFilename209)}       | ${Path.resolve(packageRoot, fixtureLongPath, longFilename209)}
        ${Path.resolve(packageRoot, fixtureLongPath, longFilenameIssue4978)} | ${Path.resolve(packageRoot, fixtureLongPath, longFilenameIssue4978)}
    `('urlToFilePathOrHref $filePath', ({ filePath, expected }) => {
        const builder = new FileUrlBuilder();
        expect(builder.urlToFilePathOrHref(builder.toFileURL(filePath))).toEqual(expected);
    });

    test.each`
        filePath                                                                                   | expected
        ${thisFilePath}                                                                            | ${new URL(import.meta.url).pathname}
        ${Path.resolve(packageRoot, fixtureLongPath, longFilename209)}                             | ${pathToFileURL(Path.resolve(packageRoot, fixtureLongPath, longFilename209)).pathname}
        ${Path.resolve(packageRoot, fixtureLongPath, longFilenameIssue4978)}                       | ${pathToFileURL(Path.resolve(packageRoot, fixtureLongPath, longFilenameIssue4978)).pathname}
        ${addLongPathPrefix(Path.resolve(packageRoot, fixtureLongPath, longFilename209))}          | ${pathToFileURL(Path.resolve(packageRoot, fixtureLongPath, longFilename209)).pathname}
        ${addLongPathPrefix(Path.resolve(packageRoot, fixtureLongPath, longFilenameIssue4978))}    | ${pathToFileURL(Path.resolve(packageRoot, fixtureLongPath, longFilenameIssue4978)).pathname}
        ${addLongPathPrefixAlt(Path.resolve(packageRoot, fixtureLongPath, longFilename209))}       | ${pathToFileURL(Path.resolve(packageRoot, fixtureLongPath, longFilename209)).pathname}
        ${addLongPathPrefixAlt(Path.resolve(packageRoot, fixtureLongPath, longFilenameIssue4978))} | ${pathToFileURL(Path.resolve(packageRoot, fixtureLongPath, longFilenameIssue4978)).pathname}
    `('toFileURL long unc prefix $filePath', async ({ filePath, expected }) => {
        const builder = new FileUrlBuilder();
        const url = builder.toFileURL(filePath);
        expect(url.pathname).toEqual(expected);
    });

    test('ParsedPath matches Path.ParsedPath', () => {
        const pp: ParsedPath = Path.parse('e:/path/to/file.txt');
        const pp2: Path.ParsedPath = pp;
        expect(pp2).toEqual(pp);
    });
});
