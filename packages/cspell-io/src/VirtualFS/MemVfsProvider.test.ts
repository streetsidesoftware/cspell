import { describe, expect, test } from 'vitest';

import type { FileResource } from '../models/FileResource.js';
import { VFSNotFoundError, VFSNotSupported } from './errors.js';
import { MemFileSystemProvider, MemVFileSystem } from './MemVfsProvider.js';

describe('MemFileSystemProvider', () => {
    test('should create a new MemFileSystemProvider', () => {
        using provider = new MemFileSystemProvider('test', 'cspell-vfs:');
        expect(provider).toBeInstanceOf(MemFileSystemProvider);
    });

    test('should return the file system for the correct protocol', () => {
        const provider = new MemFileSystemProvider('test', 'cspell-vfs:');
        const fs = provider.getFileSystem(new URL('cspell-vfs://test/file.txt'));
        expect(fs).toBeInstanceOf(MemVFileSystem);
        expect(provider.memFS).toBeInstanceOf(MemVFileSystem);
    });

    test('should return undefined for the wrong protocol', () => {
        const provider = new MemFileSystemProvider('test', 'cspell-vfs:');
        const fs = provider.getFileSystem(new URL('other-protocol://test/file.txt'));
        expect(fs).toBeUndefined();
    });
});

describe('MemVFileSystem', () => {
    test('should create a new MemVFileSystem', () => {
        using memFS = new MemVFileSystem('test', 'cspell-vfs:');
        expect(memFS).toBeInstanceOf(MemVFileSystem);
    });
    test('should write and read a file', async () => {
        using memFS = new MemVFileSystem('test', 'cspell-vfs:');
        const file: FileResource = {
            url: new URL('cspell-vfs://test/file.txt'),
            content: new Uint8Array([1, 2, 3]),
        };
        const now = performance.now();
        await memFS.writeFile(file);
        const readFile = await memFS.readFile(file.url);
        expect(readFile).toEqual(file);
        const stats = memFS.stat(file);
        expect(stats.size).toEqual(file.content.length);
        expect(stats.mtimeMs).toBeGreaterThanOrEqual(now);
    });

    test('should throw an error when reading a non-existent file', async () => {
        using memFS = new MemVFileSystem('test', 'cspell-vfs:');
        await expect(memFS.readFile(new URL('cspell-vfs://test/nonexistent.txt'))).rejects.toThrow(VFSNotFoundError);
    });

    test('readDirectory should throw an error', async () => {
        using memFS = new MemVFileSystem('test', 'cspell-vfs:');
        await expect(memFS.readDirectory(new URL('cspell-vfs://test/'))).rejects.toThrowError(VFSNotSupported);
    });
});
