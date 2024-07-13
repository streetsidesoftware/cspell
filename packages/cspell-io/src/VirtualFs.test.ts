import assert from 'node:assert';
import { basename } from 'node:path';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { CFileResource } from './common/index.js';
import { createVirtualFS, getDefaultVFileSystem } from './CVirtualFS.js';
import { FileType } from './models/Stats.js';
import { toFileURL, urlBasename } from './node/file/url.js';
import { pathToSample as ps } from './test/test.helper.js';
import { FSCapabilityFlags } from './VFileSystem.js';
import type { VFileSystemProvider, VirtualFS, VProviderFileSystem } from './VirtualFS.js';
import { VFSErrorUnsupportedRequest } from './VirtualFS/WrappedProviderFs.js';

const sc = (m: string) => expect.stringContaining(m);
const oc = <T>(obj: T) => expect.objectContaining(obj);

let mockConsoleLog = vi.spyOn(console, 'log');

describe('VirtualFs', () => {
    let virtualFs: VirtualFS;

    beforeEach(() => {
        virtualFs = createVirtualFS();
        mockConsoleLog = vi.spyOn(console, 'log');
    });

    afterEach(() => {
        virtualFs.dispose();
        vi.resetAllMocks();
    });

    test('should create a file system', () => {
        const defaultFs = virtualFs.getFS(new URL('file:///'));
        const provider = mockFileSystemProvider();
        const mfs = mockFileSystem();
        const mockGetFileSystem = vi.mocked(provider.getFileSystem);
        mockGetFileSystem.mockImplementation((url) => (url.protocol === 'file:' ? mfs : undefined));
        const d = virtualFs.registerFileSystemProvider(provider);
        const fs = virtualFs.getFS(new URL('file:///'));
        expect(fs.hasProvider).toBe(true);
        expect(fs.providerInfo.name).toBe('mockFileSystemProvider');

        expect(mockGetFileSystem).toHaveBeenCalledTimes(1);

        // ask again
        const fs2 = virtualFs.getFS(new URL('file:///'));
        expect(fs2.hasProvider).toBe(true);
        expect(fs2.providerInfo).toBe(mfs.providerInfo);

        expect(mockGetFileSystem).toHaveBeenCalledTimes(1);

        d.dispose();

        // ask again
        const fs3 = virtualFs.getFS(new URL('file:///'));
        expect(fs3).toBeDefined();
        expect(fs3.hasProvider).toBe(true);
        expect(fs3.providerInfo).toBe(defaultFs.providerInfo);
    });

    test('should dispose of everything', () => {
        const virtualFs = createVirtualFS();
        const provider = mockFileSystemProvider();
        const mfs = mockFileSystem();
        const mockGetFileSystem = vi.mocked(provider.getFileSystem);
        mockGetFileSystem.mockImplementation((url) => (url.protocol === 'file:' ? mfs : undefined));
        virtualFs.registerFileSystemProvider(provider);
        const fs = virtualFs.getFS(new URL('file:///'));
        expect(fs.hasProvider).toBe(true);
        expect(fs.providerInfo.name).toBe('mockFileSystemProvider');

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
        expect(fs.hasProvider).toBe(true);
        expect(fs).not.toBe(mfs);
        d.dispose();
    });

    test('should not find a FS', async () => {
        const provider = mockFileSystemProvider();
        vi.mocked(provider.getFileSystem).mockImplementation((url, next) => next(url));
        virtualFs.registerFileSystemProvider(provider);
        const url = new URL('ftp://example.com/data.json');
        const fs = virtualFs.getFS(url);
        expect(fs.hasProvider).toBe(false);

        await expect(fs.readFile(url)).rejects.toThrowError('Unsupported request: readFile');
    });

    test('should have a file: default when calling next', () => {
        const provider = mockFileSystemProvider();
        const mfs = mockFileSystem();
        vi.mocked(provider.getFileSystem).mockImplementation((url, next) => next(url));
        virtualFs.registerFileSystemProvider(provider);
        const fs = virtualFs.getFS(new URL('file:///'));
        expect(fs.hasProvider).toBe(true);
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
        await expect(result).resolves.toEqual(
            expect.arrayContaining([
                oc({
                    fileType: 1,
                    url: new URL(import.meta.url),
                    name: urlBasename(import.meta.url),
                    dir: new URL('.', import.meta.url),
                }),
            ]),
        );
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
        await expect(result).rejects.toEqual(new Error('Unsupported request: readFile'));
        await expect(result).rejects.toBeInstanceOf(VFSErrorUnsupportedRequest);
    });

    test('try unsupported stat', async () => {
        const fs = virtualFs.fs;
        const result = fs.stat(new URL('ftp://example.com/data.json'));
        await expect(result).rejects.toEqual(new Error('Unsupported request: stat'));
        await expect(result).rejects.toBeInstanceOf(VFSErrorUnsupportedRequest);
    });

    test('try unsupported readDirectory', async () => {
        const fs = virtualFs.fs;
        const result = fs.readDirectory(new URL('ftp://example.com/data.json'));
        await expect(result).rejects.toEqual(new Error('Unsupported request: readDirectory'));
        await expect(result).rejects.toBeInstanceOf(VFSErrorUnsupportedRequest);
    });

    test.each`
        filename               | baseFilename            | content
        ${__filename}          | ${basename(__filename)} | ${sc('This bit of text')}
        ${ps('cities.txt')}    | ${'cities.txt'}         | ${sc('San Francisco\n')}
        ${ps('link.txt')}      | ${'link.txt'}           | ${sc('San Francisco\n')}
        ${ps('cities.txt.gz')} | ${'cities.txt.gz'}      | ${sc('San Francisco\n')}
    `('readFile $filename', async ({ filename, content, baseFilename }) => {
        const url = toFileURL(filename);
        const fs = getDefaultVFileSystem();
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
        const fs = getDefaultVFileSystem();
        await expect(fs.readFile(url)).rejects.toEqual(expected);
    });

    test.each`
        url               | expected
        ${__filename}     | ${oc({ mtimeMs: expect.any(Number), size: expect.any(Number), fileType: 1 })}
        ${ps('link.txt')} | ${oc({ mtimeMs: expect.any(Number), size: expect.any(Number), fileType: 1 }) /* links are resolved */}
    `('getStat $url', async ({ url, expected }) => {
        url = toFileURL(url);
        const fs = getDefaultVFileSystem();
        const s = await fs.stat(url);
        expect(mockConsoleLog).not.toHaveBeenCalled();
        expect(s).toEqual(expected);
        expect(s.isFile()).toBe(true);
        expect(s.isDirectory()).toBe(false);
        expect(s.isUnknown()).toBe(false);
        expect(s.eTag).toBeUndefined();
    });

    test.each`
        url           | expected
        ${__filename} | ${oc({ mtimeMs: expect.any(Number), size: expect.any(Number), fileType: 1 })}
    `('getStat with logging $url', async ({ url, expected }) => {
        url = toFileURL(url);
        const virtualFs = createVirtualFS();
        virtualFs.enableLogging();
        const fs = virtualFs.fs;
        const s = await fs.stat(url);
        expect(mockConsoleLog).toHaveBeenCalledTimes(2);
        expect(s).toEqual(expected);
        expect(s.isFile()).toBe(true);
        expect(s.isDirectory()).toBe(false);
        expect(s.isUnknown()).toBe(false);
        expect(s.eTag).toBeUndefined();
        virtualFs.dispose();
    });

    test.each`
        url                                                                              | expected
        ${'https://raw.gitubusrcotent.com/streetsidesoftware/cspell/main/tsconfig.json'} | ${oc({ code: 'ENOTFOUND' })}
        ${ps(__dirname, 'not-found.nf')}                                                 | ${oc({ code: 'ENOENT' })}
    `('getStat with error $url', { timeout: 30_000 }, async ({ url, expected }) => {
        url = toFileURL(url);
        const fs = getDefaultVFileSystem();
        const r = fs.stat(url);
        await expect(r).rejects.toEqual(expected);
    });

    test('writeFile', async () => {
        const provider = mockFileSystemProvider();
        const mfs = mockFileSystem();
        vi.mocked(provider.getFileSystem).mockImplementation((_url) => mfs);
        const d = virtualFs.registerFileSystemProvider(provider);
        const mockedWriteFile = vi.mocked(mfs.writeFile);
        mockedWriteFile.mockImplementation((file) => Promise.resolve({ url: file.url }));
        const fs = virtualFs.fs;
        const file = { url: new URL('file:///hello.txt'), content: 'Hello World' };
        const result = await fs.writeFile(file);
        expect(mockedWriteFile).toHaveBeenCalledTimes(1);
        expect(mockedWriteFile).toHaveBeenLastCalledWith(file);
        expect(result).not.toBe(file);
        expect(result).toStrictEqual(oc({ url: file.url }));
        d.dispose();
    });

    test('fsCapabilities', () => {
        const fs = virtualFs.fs;
        const capabilities = fs.getCapabilities(new URL('file:///hello.txt'));
        expect(capabilities).toBeDefined();
        expect(capabilities.readFile).toBe(true);
        expect(capabilities.writeFile).toBe(true);
        expect(capabilities.stat).toBe(true);
        expect(capabilities.readDirectory).toBe(true);
        expect(capabilities.writeDirectory).toBe(false);
    });

    test('symbolic links', async () => {
        const linkPath = ps('link.txt');
        const linkURL = toFileURL(linkPath);
        const fs = virtualFs.fs;

        const stat = await fs.stat(linkURL);
        expect(stat.isFile()).toBe(true);
        expect(stat.isDirectory()).toBe(false);
        expect(stat.isSymbolicLink()).toBe(false);

        const result = fs.readDirectory(new URL('.', linkURL));
        await expect(result).resolves.toEqual(
            expect.arrayContaining([
                oc({
                    fileType: FileType.SymbolicLink,
                    url: linkURL,
                    name: urlBasename(linkURL),
                    dir: new URL('.', linkURL),
                }),
            ]),
        );
    });
});

function mockFileSystem(): VProviderFileSystem {
    const p: VProviderFileSystem = {
        providerInfo: { name: 'mockFileSystemProvider' },
        capabilities: FSCapabilityFlags.Stat | FSCapabilityFlags.ReadWrite | FSCapabilityFlags.ReadDir,
        stat: vi.fn(),
        readFile: vi.fn(),
        readDirectory: vi.fn(),
        writeFile: vi.fn(),
        dispose: vi.fn(),
        getCapabilities: vi.fn(),
    };
    return p;
}

function mockFileSystemProvider(): VFileSystemProvider {
    const p: VFileSystemProvider = {
        name: 'mockFileSystemProvider',
        getFileSystem: vi.fn(),
        dispose: vi.fn(),
    };
    return p;
}
