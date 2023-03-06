import * as path from 'path';
import { afterEach, beforeEach, describe, expect, type Mock, test, vi } from 'vitest';

import { createFromFile } from '../../../lib/file-entry-cache.cjs';
import * as fileHelper from '../../util/fileHelper.js';
import type { CachedFileResult, CSpellCacheMeta } from './DiskCache.js';
import { __testing__, DiskCache } from './DiskCache.js';

const { calcVersion } = __testing__;

vi.mock('../../../lib/file-entry-cache.cjs', () => ({
    createFromFile: vi.fn().mockReturnValue({
        getFileDescriptor: vi.fn(),
        reconcile: vi.fn(),
        analyzeFiles: vi.fn().mockReturnValue({
            changedFiles: [],
            notFoundFiles: [],
            notChangedFiles: [],
        }),
        destroy: vi.fn(),
    }),
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

describe('DiskCache', () => {
    let diskCache: DiskCache;
    let fileEntryCache: {
        getFileDescriptor: Mock;
        reconcile: Mock;
        analyzeFiles: Mock;
        destroy: Mock;
    };

    beforeEach(() => {
        diskCache = new DiskCache('.foobar', false, 'version', false);
        fileEntryCache = mockCreateFileEntryCache.mock.results[0].value;
    });

    describe('constructor', () => {
        test('creates file-entry-cache in specified location', () => {
            expect(mockCreateFileEntryCache).toHaveBeenCalledTimes(1);
            expect(mockCreateFileEntryCache).toHaveBeenCalledWith(path.resolve('.foobar'), false);
        });
    });

    describe('getCachedLintResults', () => {
        test('returns undefined for not found files', async () => {
            fileEntryCache.getFileDescriptor.mockReturnValue({ notFound: true });
            expect(await diskCache.getCachedLintResults('file')).toEqual(undefined);
        });

        test('returns undefined for changed files', async () => {
            fileEntryCache.getFileDescriptor.mockReturnValue({ changed: true });
            expect(await diskCache.getCachedLintResults('file')).toEqual(undefined);
        });

        test('returns cached result', async () => {
            fileEntryCache.getFileDescriptor.mockReturnValue(entry(RESULT_NO_ISSUES));

            const cachedResult = await diskCache.getCachedLintResults('file');

            expect(cachedResult).toMatchObject(RESULT_NO_ISSUES);
            expect(cachedResult?.elapsedTimeMs).toBeUndefined();
            expect(cachedResult?.cached).toBe(true);

            expect(mockReadFileInfo).toHaveBeenCalledTimes(0);
            expect(cachedResult?.fileInfo.filename).toEqual('file');
        });

        test('returns cached result for empty files', async () => {
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
            fileEntryCache.getFileDescriptor.mockReturnValue(entry(RESULT_NO_ISSUES, ['fileA', 'fileB']));

            fileEntryCache.analyzeFiles.mockReturnValue({
                changedFiles: ['fileA', 'fileB'],
                notFoundFiles: [],
                notChangedFiles: [],
            });

            expect(await diskCache.getCachedLintResults('file')).toBeUndefined();
            expect(await diskCache.getCachedLintResults('file')).toBeUndefined();
        });
    });

    describe('setCachedLintResults', () => {
        test('skips not found files', () => {
            const descriptor = { notFound: true, meta: { result: undefined } };
            fileEntryCache.getFileDescriptor.mockReturnValue(descriptor);
            diskCache.setCachedLintResults(
                {
                    fileInfo: { filename: 'some-file' },
                    processed: true,
                    issues: [],
                    errors: 0,
                    configErrors: 0,
                    elapsedTimeMs: 100,
                },
                []
            );

            expect(descriptor.meta.result).toBeUndefined();
        });

        test('writes result and config hash to cache', () => {
            const descriptor = { meta: { data: { r: undefined } } };
            fileEntryCache.getFileDescriptor.mockReturnValue(descriptor);

            const result = {
                processed: true,
                issues: [],
                errors: 0,
                configErrors: 0,
            };
            diskCache.setCachedLintResults({ ...result, fileInfo: { filename: 'some-file' }, elapsedTimeMs: 100 }, []);

            expect(fileEntryCache.getFileDescriptor).toHaveBeenCalledWith('some-file');
            expect(descriptor.meta.data.r).toEqual(result);
        });
    });

    describe('reconcile', () => {
        test('call cache.reconcile()', () => {
            diskCache.reconcile();
            expect(fileEntryCache.reconcile).toHaveBeenCalledTimes(1);
        });
    });

    describe('reset', () => {
        test('resets', () => {
            diskCache.reset();
            expect(fileEntryCache.destroy).toHaveBeenCalledTimes(1);
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
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
