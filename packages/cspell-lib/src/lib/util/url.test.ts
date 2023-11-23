import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { describe, expect, test } from 'vitest';

import { srcDirectory } from '../../lib-cjs/pkg-info.cjs';
import {
    cwdURL,
    getSourceDirectoryUrl,
    isDataURL,
    isFileURL,
    isURLLike,
    normalizePathSlashesForUrl,
    relativeTo,
    resolveFileWithURL,
    toFilePathOrHref,
    toFileUrl,
} from './url.js';

describe('url', () => {
    describe('toFilePathOrHref', () => {
        test.each`
            url                            | expected
            ${u('/path/to/file.txt')}      | ${f(u('/path/to/file.txt'))}
            ${u('/path/to/file.txt').href} | ${f(u('/path/to/file.txt'))}
        `('should convert a file URL to a path $url', ({ url, expected }) => {
            const result = toFilePathOrHref(url);
            expect(result).toBe(expected);
        });

        test('should return the href for non-file URLs', () => {
            const url = new URL('https://example.com');
            const result = toFilePathOrHref(url);
            expect(result).toBe('https://example.com/');
        });
    });

    describe('getSourceDirectoryUrl', () => {
        test('should return the URL for the source directory', () => {
            const result = getSourceDirectoryUrl();
            expect(result.href).toBe(pathToFileURL(srcDirectory + '/').href);
        });
    });

    describe('relativeTo', () => {
        test('should resolve a path relative to a URL', () => {
            const path = 'file.txt';
            const relativeToUrl = u('/path/to/');
            const result = relativeTo(path, relativeToUrl);
            expect(result.href).toBe(u('/path/to/file.txt').href);
        });

        test('should resolve a path relative to the current working directory if no URL is provided', () => {
            const filePath = 'file.txt';
            const result = relativeTo(filePath);
            expect(result.href).toBe(pathToFileURL(path.join(process.cwd(), 'file.txt')).href);
        });

        test.each`
            filename          | relativeToUrl               | expected
            ${process.cwd()}  | ${undefined}                | ${pathToFileURL(process.cwd())}
            ${'src/file.txt'} | ${undefined}                | ${pathToFileURL(path.join(process.cwd(), 'src/file.txt'))}
            ${'src/file.txt'} | ${new URL(import.meta.url)} | ${new URL('src/file.txt', import.meta.url)}
            ${process.cwd()}  | ${new URL(import.meta.url)} | ${pathToFileURL(process.cwd())}
        `('relativeTo $filename $relativeToUrl', ({ filename, relativeToUrl, expected }) => {
            const result = relativeTo(filename, relativeToUrl);
            expect(result.href).toBe(expected?.href);
        });
    });

    describe('normalizePathSlashes', () => {
        test('should normalize path slashes', () => {
            const filePath = '\\path\\to\\file.txt';
            const result = normalizePathSlashesForUrl(filePath, '\\');
            expect(result).toBe('/path/to/file.txt');
        });

        test('should not modify path with already normalized slashes', () => {
            const filePath = '/path/to/file.txt';
            const result = normalizePathSlashesForUrl(filePath);
            expect(result).toBe('/path/to/file.txt');
        });

        test('should handle Windows drive letters', () => {
            const filePath = 'c:\\path\\to\\file.txt';
            const result = normalizePathSlashesForUrl(filePath, '\\');
            expect(result).toBe('/c:/path/to/file.txt');
        });

        test('should handle Windows drive letters', () => {
            const filePath = 'c:/path/to/file.txt';
            const result = normalizePathSlashesForUrl(filePath);
            expect(result).toBe('/c:/path/to/file.txt');
        });

        test('should handle empty path', () => {
            const filePath = '';
            const result = normalizePathSlashesForUrl(filePath);
            expect(result).toBe('');
        });
    });

    describe('cwdURL', () => {
        test('should return the URL for the current working directory', () => {
            const result = cwdURL();
            expect(result.href).toBe(pathToFileURL(process.cwd() + '/').href);
        });
    });

    describe('resolveFileWithURL', () => {
        test.each`
            file                                | relativeToUrl                                    | expected
            ${u('/path/to/test/file.txt')}      | ${u('/path/to/')}                                | ${u('/path/to/test/file.txt').href}
            ${u('/path/to/test/file.txt').href} | ${u('/path/to/')}                                | ${u('/path/to/test/file.txt').href}
            ${'file.txt'}                       | ${u('/path/to/README.md')}                       | ${u('/path/to/file.txt').href}
            ${'.'}                              | ${u('/path/to/README.md')}                       | ${u('/path/to/').href}
            ${'..'}                             | ${u('/path/to/README.md')}                       | ${u('/path/').href}
            ${'../code/'}                       | ${u('/path/to/README.md')}                       | ${u('/path/code/').href}
            ${'../file.txt'}                    | ${u('/path/to/')}                                | ${u('/path/file.txt').href}
            ${'../file.txt'}                    | ${u('https://example.com/example/code/project')} | ${'https://example.com/example/file.txt'}
            ${'../file.txt'}                    | ${u('https://example.com/example/code/')}        | ${'https://example.com/example/file.txt'}
            ${'https://example.com/data'}       | ${u('/path/to/')}                                | ${'https://example.com/data'}
        `('should resolve a file URL relative to a URL $file $relativeToUrl', ({ file, relativeToUrl, expected }) => {
            const result = resolveFileWithURL(file, relativeToUrl);
            expect(result.href).toBe(expected);
        });

        test('should resolve a file path relative to a URL', () => {
            const file = 'file.txt';
            const relativeToUrl = u('/path/to/');
            const result = resolveFileWithURL(file, relativeToUrl);
            expect(result.href).toBe(u('/path/to/file.txt').href);
        });
    });

    describe('toFileUrl', () => {
        test('should convert a file path to a file URL', () => {
            const file = '/path/to/file.txt';
            const result = toFileUrl(file);
            expect(result.href).toBe(u('/path/to/file.txt').href);
        });

        test('should return the input if it is already a file URL', () => {
            const file = u('/path/to/file.txt');
            const result = toFileUrl(file);
            expect(result.href).toBe(u('/path/to/file.txt').href);
        });
    });

    test.each`
        url                               | expected
        ${''}                             | ${false}
        ${'data:'}                        | ${true}
        ${'file:///User/home'}            | ${true}
        ${import.meta.url}                | ${true}
        ${new URL('.', import.meta.url)}  | ${true}
        ${'https://example.com/file.txt'} | ${true}
    `('isURLLike $url', ({ url, expected }) => {
        expect(isURLLike(url)).toBe(expected);
    });

    test.each`
        url                               | expected
        ${''}                             | ${false}
        ${'data:'}                        | ${false}
        ${'file:///User/home'}            | ${true}
        ${import.meta.url}                | ${true}
        ${new URL('.', import.meta.url)}  | ${true}
        ${'https://example.com/file.txt'} | ${false}
    `('isFileURL $url', ({ url, expected }) => {
        expect(isFileURL(url)).toBe(expected);
    });

    test.each`
        url                               | expected
        ${''}                             | ${false}
        ${'data:'}                        | ${true}
        ${'file:///User/home'}            | ${false}
        ${'https://example.com/file.txt'} | ${false}
    `('isFileURL $url', ({ url, expected }) => {
        expect(isDataURL(url)).toBe(expected);
    });
});

const rootURL = new URL('/', import.meta.url);

function u(url: string) {
    return new URL(url, rootURL);
}

function f(url: URL) {
    return fileURLToPath(url);
}
