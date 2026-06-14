import fs from 'node:fs/promises';
import Path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { describe, expect, test } from 'vitest';

import { urlBasename } from './dataUrl.mts';
import { normalizeFilePathForUrl, toFileDirURL, toFileURL } from './defaultFileUrlBuilder.mts';
import {
    addLongPathPrefix,
    addLongPathPrefixAlt,
    isWindows,
    isWindowsFileUrl,
    pathWindowsDriveLetterToUpper,
    toFilePathOrHref,
    uncLongPathPrefix,
    uncLongPathPrefixAlt,
} from './fileUrl.mts';
import { FileUrlBuilder } from './FileUrlBuilder.mts';
import { isUrlLike, normalizeWindowsUrl, toURL, urlParent } from './url.mts';

const root = Path.join(__dirname, '../..');
// const oc = <T>(obj: T) => expect.objectContaining(obj);
// const sc = (m: string) => expect.stringContaining(m);
const sm = (m: string | RegExp) => expect.stringMatching(m);

const cwdURL = pathToFileURL('.');

const packageRootUrl = new URL('../', import.meta.url);
const packageRoot = fileURLToPath(packageRootUrl);
const fixtureLongPath = 'fixtures/unc-long-path/learn.microsoft.com/en-us/dotnet/standard/io/file-path-formats';
// Note `.log` files are used to keep them out of the .git repository since git has issues with long paths on Windows.
const longFilename209 = `\
very-long-filename-to-test-url-handling-in-cspell-io-and-cspell-url-utilities-for-long-paths-on-windows-to-ensure-\
that-these-tools-can-handle-long-paths-on-windows-without-issues-it-is-209-characters-long.log\
`;
// https://github.com/streetsidesoftware/vscode-spell-checker/issues/4978
const longFilenameIssue4978 = `\
Engineering/Programming/Aerials/LCS Y2020/y2020_controller/local_builds/2512/251216/RNE_Aerial_Dev/162221_5cf5637b6_cmorris\
/23461B-001_ID025_Aux_Control_Platform_Leveling_Y2020_TTC2310/23461B-001_ID025_Aux_Control_Platform_Leveling_Y2020_TTC2310_controller.log\
`;

// cspell:ignore cmorris

describe('util', () => {
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
        file                                                                       | expected
        ${'samples/cities.txt'}                                                    | ${uh('samples/cities.txt')}
        ${'samples/cities.txt.gz'}                                                 | ${uh('samples/cities.txt.gz')}
        ${'https://github.com/streetsidesoftware/cspell-io/samples/cities.txt.gz'} | ${'https://github.com/streetsidesoftware/cspell-io/samples/cities.txt.gz'}
        ${'https://github.com/streetsidesoftware/cspell-io/samples/cities.txt'}    | ${'https://github.com/streetsidesoftware/cspell-io/samples/cities.txt'}
    `('toFileURL $file', async ({ file, expected }) => {
        const url = toFileURL(file, root);
        expect(url.href).toEqual(expected);
    });

    test.each`
        file                                                                                                | expected
        ${'samples/cities.txt'}                                                                             | ${'cities.txt'}
        ${'samples/cities.txt.gz'}                                                                          | ${'cities.txt.gz'}
        ${'https://example.com/dir/file.txt'}                                                               | ${'file.txt'}
        ${'https://example.com/dir/'}                                                                       | ${'dir/'}
        ${'https://example.com/dir/path/'}                                                                  | ${'path/'}
        ${'https://github.com/streetsidesoftware/cspell/raw/main/packages/cspell-io/samples/cities.txt'}    | ${'cities.txt'}
        ${'https://github.com/streetsidesoftware/cspell/raw/main/packages/cspell-io/samples/cities.txt.gz'} | ${'cities.txt.gz'}
        ${'data:text/plain;charset=utf8,Hello%2C%20World!'}                                                 | ${'text.plain'}
        ${'data:text/plain;charset=utf8;filename=cities.txt,New%20York'}                                    | ${'cities.txt'}
        ${'data:'}                                                                                          | ${''}
        ${'data:application/gzip;base64,H'}                                                                 | ${'application.gzip'}
        ${toURL('data:application/gzip;base64,H')}                                                          | ${'application.gzip'}
        ${'data:application/vnd.cspell.dictionary+trie,H'}                                                  | ${'application.vnd.cspell.dictionary.trie'}
    `('urlBasename $file', async ({ file, expected }) => {
        const filename = isUrlLike(file) ? file : toFileURL(Path.resolve(root, file));
        expect(urlBasename(filename)).toEqual(expected);
    });

    test.each`
        file                                                                                                | expected
        ${'samples/cities.txt'}                                                                             | ${sm(/file:.*\/samples\/$/)}
        ${'samples/cities.txt.gz'}                                                                          | ${sm(/file:.*\/samples\/$/)}
        ${'samples/code/'}                                                                                  | ${sm(/file:.*\/samples\/$/)}
        ${'file://samples/code/'}                                                                           | ${sm(/file:.*\/samples\/$/)}
        ${'https://github.com/streetsidesoftware/cspell/raw/main/packages/cspell-io/samples/cities.txt'}    | ${sm(/https:.*\/samples\/$/)}
        ${'https://github.com/streetsidesoftware/cspell/raw/main/packages/cspell-io/samples/cities.txt.gz'} | ${sm(/https:.*\/samples\/$/)}
        ${'https://github.com/streetsidesoftware/cspell/raw/main/packages/cspell-io/samples/code/'}         | ${sm(/https:.*\/samples\/$/)}
    `('urlDirname $file', async ({ file, expected }) => {
        const filename = isUrlLike(file) ? file : toFileURL(Path.resolve(root, file));
        expect(urlParent(filename).toString()).toEqual(expected);
    });

    test.each`
        path               | expected
        ${'path/to/file'}  | ${'path/to/file'}
        ${'/some/path%.c'} | ${'/some/path%25.c'}
    `('normalizePathForUrl $path', ({ path, expected }) => {
        expect(normalizeFilePathForUrl(path)).toEqual(expected);
    });

    test.each`
        path                     | windows | expected
        ${'path/to/file'}        | ${true} | ${'path/to/file'}
        ${'path\\to\\file.txt'}  | ${true} | ${'path/to/file.txt'}
        ${'C:/path/to/file'}     | ${true} | ${'/C:/path/to/file'}
        ${'d:/path/to/file'}     | ${true} | ${'/D:/path/to/file'}
        ${'http://example.com/'} | ${true} | ${'http://example.com/'}
        ${'path/to/file/'}       | ${true} | ${'path/to/file/'}
        ${'path/to/file\\'}      | ${true} | ${'path/to/file/'}
        ${'path\\to\\file/'}     | ${true} | ${'path/to/file/'}
        ${'path\\to/file/'}      | ${true} | ${'path/to/file/'}
        ${'path/to/file,/#'}     | ${true} | ${'path/to/file,/%23'}
        ${'path/to/file\\'}      | ${true} | ${'path/to/file/'}
        ${'path\\to/file/'}      | ${true} | ${'path/to/file/'}
        ${'/some/path%.c'}       | ${true} | ${'/some/path%25.c'}
    `('normalizePathForUrl $path, $windows', ({ path, windows, expected }) => {
        const fileUrlBuilder = new FileUrlBuilder({ windows });
        expect(fileUrlBuilder.normalizeFilePathForUrl(path)).toEqual(expected);
    });

    test.each`
        url                           | expected
        ${toFileURL('file.txt')}      | ${Path.resolve('file.txt')}
        ${toFileURL('file.txt').href} | ${Path.resolve('file.txt')}
        ${import.meta.url}            | ${fileURLToPath(import.meta.url)}
        ${'stdin:sample.py'}          | ${'stdin:sample.py'}
    `('toFilePathOrHref $url', ({ url, expected }) => {
        expect(toFilePathOrHref(url)).toEqual(expected);
    });

    test.each`
        url                        | expected
        ${toFileURL('./').href}    | ${normalizeWindowsUrl(pathToFileURL('./')).href}
        ${'.'}                     | ${normalizeWindowsUrl(pathToFileURL('./')).href}
        ${'data:application/json'} | ${'data:application/json'}
        ${'stdin:file.txt'}        | ${'stdin:file.txt'}
        ${'stdin:/path/to/dir'}    | ${'stdin:/path/to/dir/'}
    `('toFileDirURL $url', ({ url, expected }) => {
        expect(toFileDirURL(url).href).toEqual(expected);
    });

    test.each`
        path                         | expected
        ${'d:\\user\\data\\file.md'} | ${'D:\\user\\data\\file.md'}
        ${'c:/user/data/file.md'}    | ${'C:/user/data/file.md'}
        ${'data:application/json'}   | ${'data:application/json'}
        ${'stdin:file.txt'}          | ${'stdin:file.txt'}
        ${'stdin:/path/to/dir'}      | ${'stdin:/path/to/dir'}
    `('pathWindowsDriveLetterToUpper $path', ({ path, expected }) => {
        expect(pathWindowsDriveLetterToUpper(path)).toEqual(expected);
    });

    test.each`
        url                               | expected
        ${'d:\\user\\data\\file.md'}      | ${false}
        ${'file:///c:/user/data/file.md'} | ${true}
        ${'data:application/json'}        | ${false}
        ${'stdin:file.txt'}               | ${false}
        ${'stdin:/path/to/dir'}           | ${false}
        ${import.meta.url}                | ${isWindows}
    `('isWindowsFileUrl $url', ({ url, expected }) => {
        expect(isWindowsFileUrl(url)).toEqual(expected);
    });
});

describe('url with long paths', () => {
    const urlWindowsFilePathFormats = 'https://learn.microsoft.com/en-us/dotnet/standard/io/file-path-formats';
    const absoluteFixtureLongPath = Path.join(packageRoot, fixtureLongPath);

    beforeAll(async () => {
        await ensureLongPathFileExists(longFilename209);
        await ensureLongPathFileExists(longFilenameIssue4978);
    });
    test.each`
        filename
        ${longFilename209}
        ${longFilenameIssue4978}
    `('read long path files', async ({ filename }) => {
        const absFilename = Path.resolve(absoluteFixtureLongPath, filename);
        const contents = await fs.readFile(absFilename, 'utf8');
        expect(contents).toContain(filename);

        await expect(fs.readFile(pathToFileURL(absFilename), 'utf8')).resolves.toEqual(contents);
    });

    test.each`
        filename
        ${longFilename209}
        ${longFilenameIssue4978}
    `('read long path files with prefix', async ({ filename }) => {
        const absFilename = Path.resolve(absoluteFixtureLongPath, filename);
        const absLongPathFilename = addLongPathPrefix(absFilename);
        const expectedAlt = isWindows ? uncLongPathPrefix : absFilename;
        expect(absLongPathFilename.slice(0, isWindows ? uncLongPathPrefix.length : undefined)).toBe(expectedAlt);
        const contents = await fs.readFile(absLongPathFilename, 'utf8');
        expect(contents).toContain(filename);

        await expect(fs.readFile(pathToFileURL(absLongPathFilename), 'utf8')).resolves.toEqual(contents);
    });

    test.each`
        filename
        ${longFilename209}
        ${longFilenameIssue4978}
    `('read long path files with alt prefix', async ({ filename }) => {
        const absFilename = Path.resolve(absoluteFixtureLongPath, filename);

        const absLongPathFilenameAlt = addLongPathPrefixAlt(absFilename);
        const expectedAlt = isWindows ? uncLongPathPrefixAlt : absFilename;
        expect(absLongPathFilenameAlt.slice(0, isWindows ? uncLongPathPrefixAlt.length : undefined)).toBe(expectedAlt);
        const absLongPathFilename = addLongPathPrefix(absLongPathFilenameAlt);
        const contents = await fs.readFile(absLongPathFilename, 'utf8');
        expect(contents).toContain(filename);
    });

    async function ensureLongPathFileExists(filename: string) {
        const content = `\
This is a test file for testing long path handling in cspell-url and cspell-io utilities.

Reference: ${urlWindowsFilePathFormats}

The filename is:
${filename}
`;
        const absoluteFixtureLongPathFile = addLongPathPrefix(Path.join(absoluteFixtureLongPath, filename));

        const found = await readFileIfExists(absoluteFixtureLongPathFile);

        if (found !== content) {
            await fs.mkdir(Path.dirname(absoluteFixtureLongPathFile), { recursive: true });
            console.log('Creating fixture file "%s"', absoluteFixtureLongPathFile);
            await fs.writeFile(absoluteFixtureLongPathFile, content, 'utf8');
        }
    }

    async function readFileIfExists(path: string | URL): Promise<string | undefined> {
        try {
            return await fs.readFile(path, 'utf8');
        } catch {
            return undefined;
        }
    }
});

function u(path: string, relativeURL?: string | URL) {
    return normalizeWindowsUrl(new URL(path, relativeURL));
}

function uh(path: string, relativeURL = cwdURL) {
    return u(path, relativeURL).href;
}
