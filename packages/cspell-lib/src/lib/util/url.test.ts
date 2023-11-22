import path from 'path';
import { pathToFileURL } from 'url';
import { describe, expect, test } from 'vitest';

import { srcDirectory } from '../../lib-cjs/pkg-info.cjs';
import { cwdURL, getSourceDirectoryUrl, relativeTo, resolveFileWithURL, toFilePathOrHref, toFileUrl } from './url.js';

describe('url', () => {
    describe('toFilePathOrHref', () => {
        test.each`
            url                                    | expected
            ${new URL('file:///path/to/file.txt')} | ${'/path/to/file.txt'}
            ${'file:///path/to/file.txt'}          | ${'/path/to/file.txt'}
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
            const relativeToUrl = new URL('file:///path/to/');
            const result = relativeTo(path, relativeToUrl);
            expect(result.href).toBe('file:///path/to/file.txt');
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

    describe('cwdURL', () => {
        test('should return the URL for the current working directory', () => {
            const result = cwdURL();
            expect(result.href).toBe(pathToFileURL(process.cwd() + '/').href);
        });
    });

    describe('resolveFileWithURL', () => {
        test.each`
            file                                        | relativeToUrl                  | expected
            ${new URL('file:///path/to/test/file.txt')} | ${new URL('file:///path/to/')} | ${'file:///path/to/test/file.txt'}
            ${'file:///path/to/test/file.txt'}          | ${new URL('file:///path/to/')} | ${'file:///path/to/test/file.txt'}
            ${'file.txt'}                               | ${new URL('file:///path/to/')} | ${'file:///path/to/file.txt'}
            ${'../file.txt'}                            | ${new URL('file:///path/to/')} | ${'file:///path/file.txt'}
            ${'https://example.com/data'}               | ${new URL('file:///path/to/')} | ${'https://example.com/data'}
        `('should resolve a file URL relative to a URL $file $relativeToUrl', ({ file, relativeToUrl, expected }) => {
            const result = resolveFileWithURL(file, relativeToUrl);
            expect(result.href).toBe(expected);
        });

        test('should resolve a file path relative to a URL', () => {
            const file = 'file.txt';
            const relativeToUrl = new URL('file:///path/to/');
            const result = resolveFileWithURL(file, relativeToUrl);
            expect(result.href).toBe('file:///path/to/file.txt');
        });
    });

    describe('toFileUrl', () => {
        test('should convert a file path to a file URL', () => {
            const file = '/path/to/file.txt';
            const result = toFileUrl(file);
            expect(result.href).toBe('file:///path/to/file.txt');
        });

        test('should return the input if it is already a file URL', () => {
            const file = new URL('file:///path/to/file.txt');
            const result = toFileUrl(file);
            expect(result.href).toBe('file:///path/to/file.txt');
        });
    });
});
