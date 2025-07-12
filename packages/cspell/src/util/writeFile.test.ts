import fs from 'node:fs/promises';

import { afterEach, describe, expect, test, vi } from 'vitest';

import { writeFileOrStream, writeStream } from './writeFile.js';

describe('writeFile', () => {
    afterEach(() => {
        vi.resetAllMocks();
    });
    test('writeFileOrStream stdout', async () => {
        const s = vi.spyOn(process.stdout, 'write').mockImplementation(mockWrite);
        await writeFileOrStream('stdout', 'test');
        expect(s).toHaveBeenCalledTimes(1);
        expect(s).toHaveBeenCalledWith('test', expect.any(Function));
    });

    test('writeFileOrStream stderr', async () => {
        const s = vi.spyOn(process.stderr, 'write').mockImplementation(mockWrite);
        await writeFileOrStream('stderr', 'test');
        expect(s).toHaveBeenCalledTimes(1);
        expect(s).toHaveBeenCalledWith('test', expect.any(Function));
    });

    test('writeFileOrStream null', async () => {
        const stdout = vi.spyOn(process.stdout, 'write').mockImplementation(mockWrite);
        const stderr = vi.spyOn(process.stderr, 'write').mockImplementation(mockWrite);
        const fsWriteFile = vi.spyOn(fs, 'writeFile');
        await writeFileOrStream('null', 'test');
        expect(stdout).toHaveBeenCalledTimes(0);
        expect(stderr).toHaveBeenCalledTimes(0);
        expect(fsWriteFile).toHaveBeenCalledTimes(0);
    });

    test('writeFileOrStream file', async () => {
        const stdout = vi.spyOn(process.stdout, 'write').mockImplementation(mockWrite);
        const stderr = vi.spyOn(process.stderr, 'write').mockImplementation(mockWrite);
        const fsWriteFile = vi.spyOn(fs, 'writeFile').mockResolvedValue(undefined);
        await writeFileOrStream('myfile.log', 'test');
        expect(stdout).toHaveBeenCalledTimes(0);
        expect(stderr).toHaveBeenCalledTimes(0);
        expect(fsWriteFile).toHaveBeenCalledOnce();
        expect(fsWriteFile).toHaveBeenCalledWith('myfile.log', 'test');
    });

    test('writeStream', async () => {
        const s = vi.spyOn(process.stdout, 'write').mockImplementation(mockWrite);
        await writeStream(process.stdout, 'test');
        expect(s).toHaveBeenCalledTimes(1);
    });

    test('writeStream with Error', async () => {
        vi.spyOn(process.stdout, 'write').mockImplementation(mockWriteWithError);
        await expect(writeStream(process.stdout, 'test')).rejects.toThrowError();
    });
});

function mockWrite(buffer: Uint8Array | string, cb?: (err?: Error) => void): boolean;
function mockWrite(str: Uint8Array | string, encoding?: BufferEncoding, cb?: (err?: Error) => void): boolean;
function mockWrite(
    _data: unknown,
    encodingOrCb?: BufferEncoding | ((err?: Error) => void),
    cb?: (err?: Error) => void,
) {
    if (typeof encodingOrCb === 'function') {
        cb = encodingOrCb;
    }
    cb?.();
    return true;
}

function mockWriteWithError(buffer: Uint8Array | string, cb?: (err?: Error) => void): boolean;
function mockWriteWithError(str: Uint8Array | string, encoding?: BufferEncoding, cb?: (err?: Error) => void): boolean;
function mockWriteWithError(
    _data: unknown,
    encodingOrCb?: BufferEncoding | ((err?: Error) => void),
    cb?: (err?: Error) => void,
) {
    const err = new Error('mock error');
    if (typeof encodingOrCb === 'function') {
        cb = encodingOrCb;
    }
    cb?.(err);
    return true;
}
