import assert from 'assert';
import { basename } from 'path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { CFileResource } from './common/index.js';
import { toFileURL } from './node/file/url.js';
import { pathToSample as ps } from './test/test.helper.js';
import type { FileSystem, FileSystemProvider, VirtualFS } from './VirtualFS.js';
import { createVirtualFS, getDefaultVirtualFs, VFSErrorUnhandledRequest } from './VirtualFS.js';

const sc = expect.stringContaining;
const oc = expect.objectContaining;

describe('VirtualFs', () => {
    let virtualFs: VirtualFS;

    beforeEach(() => {
        virtualFs = createVirtualFS();
    });

    afterEach(() => {
        virtualFs.dispose();
    });

    test('should create a file system', () => {
        const defaultFs = virtualFs.getFS(new URL('file:///'));
        const provider = mockFileSystemProvider();
        const mfs = mockFileSystem();
        const mockGetFileSystem = vi.mocked(provider.getFileSystem);
        mockGetFileSystem.mockImplementation((url) => (url.protocol === 'file:' ? mfs : undefined));
        const d = virtualFs.registerFileSystemProvider(provider);
        const fs = virtualFs.getFS(new URL('file:///'));
        expect(fs).toBeDefined();
        expect(fs).toBe(mfs);

        expect(mockGetFileSystem).toHaveBeenCalledTimes(1);

        // ask again
        const fs2 = virtualFs.getFS(new URL('file:///'));
        expect(fs2).toBeDefined();
        expect(fs2).toBe(mfs);

        expect(mockGetFileSystem).toHaveBeenCalledTimes(1);

        d.dispose();

        // ask again
        const fs3 = virtualFs.getFS(new URL('file:///'));
        expect(fs3).toBeDefined();
        expect(fs3).not.toBe(mfs);
        expect(fs3).toBe(defaultFs);
    });

    test('should dispose of everything', () => {
        const virtualFs = createVirtualFS();
        const provider = mockFileSystemProvider();
        const mfs = mockFileSystem();
        const mockGetFileSystem = vi.mocked(provider.getFileSystem);
        mockGetFileSystem.mockImplementation((url) => (url.protocol === 'file:' ? mfs : undefined));
        virtualFs.registerFileSystemProvider(provider);
        const fs = virtualFs.getFS(new URL('file:///'));
        expect(fs).toBeDefined();
        expect(fs).toBe(mfs);

        expect(mockGetFileSystem).toHaveBeenCalledTimes(1);

        virtualFs.dispose();

        expect(vi.mocked(provider.dispose)).toHaveBeenCalledTimes(1);
    });

    test('should have a file: default.', () => {
        const provider = mockFileSystemProvider();
        const mfs = mockFileSystem();
        vi.mocked(provider.getFileSystem).mockImplementation((url) => (url.protocol === 'untitled:' ? mfs : undefined));
        const d = virtualFs.registerFileSystemProvider(provider);
        const fs = virtualFs.getFS(new URL('file:///'));
        expect(fs).toBeDefined();
        expect(fs).not.toBe(mfs);
        d.dispose();
    });

    test('should not find a FS', () => {
        const provider = mockFileSystemProvider();
        vi.mocked(provider.getFileSystem).mockImplementation((url, next) => next(url));
        virtualFs.registerFileSystemProvider(provider);
        const fs = virtualFs.getFS(new URL('ftp://example.com/data.json'));
        expect(fs).toBeUndefined();
    });

    test('should have a file: default when calling next', () => {
        const provider = mockFileSystemProvider();
        const mfs = mockFileSystem();
        vi.mocked(provider.getFileSystem).mockImplementation((url, next) => next(url));
        virtualFs.registerFileSystemProvider(provider);
        const fs = virtualFs.getFS(new URL('file:///'));
        expect(fs).toBeDefined();
        expect(fs).not.toBe(mfs);
    });

    test('try reading a file.', async () => {
        const fs = virtualFs.fs;
        expect(fs).toBeDefined();

        const provider = mockFileSystemProvider();
        const mfs = mockFileSystem();
        vi.mocked(provider.getFileSystem).mockImplementation((_url) => mfs);
        virtualFs.registerFileSystemProvider(provider);

        vi.mocked(mfs.readFile).mockImplementation((url) => Promise.resolve(CFileResource.from(url, 'Hello World')));

        const result = fs.readFile(new URL('file:///hello.txt'));
        await expect(result).resolves.toEqual(oc({ content: 'Hello World' }));
    });

    test('try readDirectory.', async () => {
        const fs = virtualFs.fs;
        const result = fs.readDirectory(new URL('.', import.meta.url));
        await expect(result).resolves.toEqual(expect.arrayContaining([{ fileType: 1, url: new URL(import.meta.url) }]));
    });

    test('try readDirectory failure', async () => {
        const fs = virtualFs.fs;
        // Cannot read directory of a file.
        const result = fs.readDirectory(new URL(import.meta.url));
        await expect(result).rejects.toThrowError();
    });

    test('try unsupported readFile', async () => {
        const fs = virtualFs.fs;
        const result = fs.readFile(new URL('ftp://example.com/data.json'));
        await expect(result).rejects.toEqual(Error('Unhandled request: readFile'));
        await expect(result).rejects.toBeInstanceOf(VFSErrorUnhandledRequest);
    });

    test('try unsupported stat', async () => {
        const fs = virtualFs.fs;
        const result = fs.stat(new URL('ftp://example.com/data.json'));
        await expect(result).rejects.toEqual(Error('Unhandled request: stat'));
        await expect(result).rejects.toBeInstanceOf(VFSErrorUnhandledRequest);
    });

    test('try unsupported readDirectory', async () => {
        const fs = virtualFs.fs;
        const result = fs.readDirectory(new URL('ftp://example.com/data.json'));
        await expect(result).rejects.toEqual(Error('Unhandled request: readDirectory'));
        await expect(result).rejects.toBeInstanceOf(VFSErrorUnhandledRequest);
    });

    test.each`
        filename               | baseFilename            | content
        ${__filename}          | ${basename(__filename)} | ${sc('This bit of text')}
        ${ps('cities.txt')}    | ${'cities.txt'}         | ${sc('San Francisco\n')}
        ${ps('cities.txt.gz')} | ${'cities.txt.gz'}      | ${sc('San Francisco\n')}
    `('readFile $filename', async ({ filename, content, baseFilename }) => {
        const url = toFileURL(filename);
        const fs = getDefaultVirtualFs().fs;
        const expected = { url, content, baseFilename };
        const result = await fs.readFile(url);
        const gz = filename.endsWith('.gz') || undefined;
        assert(result instanceof CFileResource);
        expect(result.url).toEqual(expected.url);
        expect(result.getText()).toEqual(expected.content);
        expect(result.baseFilename).toEqual(expected.baseFilename);
        expect(!!result.gz).toEqual(!!gz);
    });

    test.each`
        filename                         | expected
        ${ps('cities.not_found.txt')}    | ${oc({ code: 'ENOENT' })}
        ${ps('cities.not_found.txt.gz')} | ${oc({ code: 'ENOENT' })}
    `('readFile not found $filename', async ({ filename, expected }) => {
        const url = toFileURL(filename);
        const fs = getDefaultVirtualFs().fs;
        await expect(fs.readFile(url)).rejects.toEqual(expected);
    });

    test.each`
        url           | expected
        ${__filename} | ${oc({ mtimeMs: expect.any(Number) })}
    `('getStat $url', async ({ url, expected }) => {
        url = toFileURL(url);
        const fs = getDefaultVirtualFs().fs;
        const r = await fs.stat(url);
        expect(r).toEqual(expected);
    });

    test.each`
        url                                                                              | expected
        ${'https://raw.gitubusrcotent.com/streetsidesoftware/cspell/main/tsconfig.json'} | ${oc({ code: 'ENOTFOUND' })}
        ${ps(__dirname, 'not-found.nf')}                                                 | ${oc({ code: 'ENOENT' })}
    `('getStat with error $url', async ({ url, expected }) => {
        url = toFileURL(url);
        const fs = getDefaultVirtualFs().fs;
        const r = fs.stat(url);
        await expect(r).rejects.toEqual(expected);
    });
});

function mockFileSystem(): FileSystem {
    const p: FileSystem = {
        stat: vi.fn(),
        readFile: vi.fn(),
        readDirectory: vi.fn(),
        dispose: vi.fn(),
    };
    return p;
}

function mockFileSystemProvider(): FileSystemProvider {
    const p: FileSystemProvider = {
        getFileSystem: vi.fn(),
        dispose: vi.fn(),
    };
    return p;
}
