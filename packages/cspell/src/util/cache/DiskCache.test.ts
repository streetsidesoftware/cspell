import { pathToFileURL } from 'node:url';

import { afterEach, beforeEach, describe, expect, type Mock, test, vi } from 'vitest';

import * as fileHelper from '../../util/fileHelper.js';
import type { CachedFileResult, CSpellCacheMeta, DiskCache } from './DiskCache.js';
import { __testing__, createDiskCache } from './DiskCache.js';
import { createFromFile } from './file-entry-cache/index.js';

const { calcVersion } = __testing__;

vi.mock('./file-entry-cache/index.js', () => ({
    createFromFile: vi.fn().mockReturnValue(
        Promise.resolve({
            getFileDescriptor: vi.fn(),
            reconcile: vi.fn(),
            destroy: vi.fn(() => Promise.resolve()),
        }),
    ),
}));

const mockCreateFileEntryCache = vi.mocked(createFromFile);

vi.mock('../../util/fileHelper', () => ({ readFileInfo: vi.fn() }));

const mockReadFileInfo = vi.mocked(fileHelper.readFileInfo);

const RESULT_NO_ISSUES: CachedFileResult = {
    processed: true,
    issues: [],
    errors: 0,
    configErrors: 0,
};

const urlCSpellReadme =
    'https://raw.githubusercontent.com/streetsidesoftware/vscode-spell-checker/refs/heads/main/README.md';

describe('DiskCache', () => {
    let diskCache: DiskCache;
    let _fileEntryCache: Promise<{
        getFileDescriptor: Mock;
        reconcile: Mock;
        destroy: Mock;
    }>;

    function getFileEntryCache(): Promise<{
        getFileDescriptor: Mock;
        reconcile: Mock;
        destroy: Mock;
    }> {
        return _fileEntryCache;
    }

    beforeEach(async () => {
        diskCache = await createDiskCache(pathToFileURL('.foobar'), false, 'version', false);
        _fileEntryCache = mockCreateFileEntryCache.mock.results[0].value;
    });

    describe('constructor', () => {
        test('creates file-entry-cache in specified location', () => {
            expect(mockCreateFileEntryCache).toHaveBeenCalledTimes(1);
            expect(mockCreateFileEntryCache).toHaveBeenCalledWith(pathToFileURL('.foobar'), false, undefined);
        });
    });

    describe('getCachedLintResults', () => {
        test('returns undefined for not found files', async () => {
            const fileEntryCache = await getFileEntryCache();
            fileEntryCache.getFileDescriptor.mockReturnValue({ notFound: true });
            expect(await diskCache.getCachedLintResults('file')).toEqual(undefined);
        });

        test('returns undefined for changed files', async () => {
            const fileEntryCache = await getFileEntryCache();
            fileEntryCache.getFileDescriptor.mockReturnValue({ changed: true });
            expect(await diskCache.getCachedLintResults('file')).toEqual(undefined);
        });

        test('returns cached result', async () => {
            const fileEntryCache = await getFileEntryCache();
            fileEntryCache.getFileDescriptor.mockReturnValue(entry(RESULT_NO_ISSUES));

            const cachedResult = await diskCache.getCachedLintResults('file');

            expect(cachedResult).toMatchObject(RESULT_NO_ISSUES);
            expect(cachedResult?.elapsedTimeMs).toBeUndefined();
            expect(cachedResult?.cached).toBe(true);

            expect(mockReadFileInfo).toHaveBeenCalledTimes(0);
            expect(cachedResult?.fileInfo.filename).toEqual('file');
        });

        test('returns cached result for empty files', async () => {
            const fileEntryCache = await getFileEntryCache();
            fileEntryCache.getFileDescriptor.mockReturnValue(entry(RESULT_NO_ISSUES));

            const cachedResult = await diskCache.getCachedLintResults('file');

            expect(cachedResult).toMatchObject(RESULT_NO_ISSUES);
            expect(cachedResult?.elapsedTimeMs).toBeUndefined();
            expect(cachedResult?.cached).toBe(true);

            expect(mockReadFileInfo).toHaveBeenCalledTimes(0);
            expect(cachedResult?.fileInfo.filename).toEqual('file');
        });

        test('returns cached result for files with errors', async () => {
            const result = { ...RESULT_NO_ISSUES, errors: 10 };
            const fileEntryCache = await getFileEntryCache();
            fileEntryCache.getFileDescriptor.mockReturnValue(entry(result));

            const fileInfo = { filename: 'file', text: 'file content' };
            mockReadFileInfo.mockReturnValue(Promise.resolve(fileInfo));

            const cachedResult = await diskCache.getCachedLintResults('file');

            expect(cachedResult).toMatchObject(result);
            expect(cachedResult?.elapsedTimeMs).toBeUndefined();
            expect(cachedResult?.cached).toBe(true);

            expect(mockReadFileInfo).toHaveBeenCalledTimes(1);
            expect(cachedResult?.fileInfo).toEqual(fileInfo);
        });

        test('with failed dependencies', async () => {
            const fileEntryCache = await getFileEntryCache();
            fileEntryCache.getFileDescriptor.mockReturnValue(entry(RESULT_NO_ISSUES, ['fileA', 'fileB']));

            expect(await diskCache.getCachedLintResults('file')).toBeUndefined();
            expect(await diskCache.getCachedLintResults('file')).toBeUndefined();
        });
    });

    describe('setCachedLintResults', () => {
        test('skips not found files', async () => {
            const descriptor = { notFound: true, meta: { result: undefined } };
            const fileEntryCache = await getFileEntryCache();
            fileEntryCache.getFileDescriptor.mockReturnValue(descriptor);
            await diskCache.setCachedLintResults(
                {
                    fileInfo: { filename: 'some-file' },
                    processed: true,
                    issues: [],
                    errors: 0,
                    configErrors: 0,
                    elapsedTimeMs: 100,
                },
                [],
            );

            expect(descriptor.meta.result).toBeUndefined();
        });

        test('writes result and config hash to cache', async () => {
            const descriptor = { meta: { data: { r: undefined } } };
            const fileEntryCache = await getFileEntryCache();
            fileEntryCache.getFileDescriptor.mockReturnValue(descriptor);

            const result = {
                processed: true,
                issues: [],
                errors: 0,
                configErrors: 0,
            };
            await diskCache.setCachedLintResults(
                { ...result, fileInfo: { filename: 'some-file' }, elapsedTimeMs: 100 },
                [],
            );

            expect(fileEntryCache.getFileDescriptor).toHaveBeenCalledWith('some-file');
            expect(descriptor.meta.data.r).toEqual(result);
        });

        test('handles remote dependencies', { timeout: 60_000 }, async () => {
            const descriptor = { meta: { data: { r: undefined } } };
            const fileEntryCache = await getFileEntryCache();
            fileEntryCache.getFileDescriptor.mockReturnValue(descriptor);

            const result = {
                processed: true,
                issues: [],
                errors: 0,
                configErrors: 0,
            };
            await diskCache.setCachedLintResults(
                { ...result, fileInfo: { filename: 'some-file' }, elapsedTimeMs: 100 },
                [urlCSpellReadme, import.meta.url],
            );

            expect(fileEntryCache.getFileDescriptor).toHaveBeenCalledWith('some-file');
            expect(descriptor.meta.data.r).toEqual(result);
        });
    });

    describe('reconcile', () => {
        test('call cache.reconcile()', async () => {
            diskCache.reconcile();
            const fileEntryCache = await getFileEntryCache();
            expect(fileEntryCache.reconcile).toHaveBeenCalledTimes(1);
        });
    });

    describe('reset', () => {
        test('resets', async () => {
            await diskCache.reset();
            const fileEntryCache = await getFileEntryCache();
            expect(fileEntryCache.destroy).toHaveBeenCalledTimes(1);
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });
});

describe('getDependencyForUrl', () => {
    test('getDependencyForUrl', { timeout: 60_000 }, async () => {
        const url = urlCSpellReadme;
        const dep = await __testing__.getDependencyForUrl(url);
        expect(dep).toEqual({
            f: url,
            h: expect.any(String),
        });
    });
});

function entry(result: CachedFileResult, dependencies: string[] = [], size = 100): { meta: CSpellCacheMeta } {
    return {
        meta: {
            size,
            data: {
                r: result,
                d: dependencies.map((f) => ({ f, h: 'hash' })),
                v: calcVersion('version'),
            },
        },
    };
}
