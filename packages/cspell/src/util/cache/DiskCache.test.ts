import * as FileEntryCacheModule from 'file-entry-cache';
import * as path from 'path';
import * as fileHelper from '../../util/fileHelper';
import { CachedFileResult, DiskCache, CSpellCacheMeta } from './DiskCache';

jest.mock('./getConfigHash', () => ({
    getConfigHash: jest.fn().mockReturnValue('TEST_CONFIG_HASH'),
}));

const mockCreateFileEntryCache = jest.spyOn(FileEntryCacheModule, 'createFromFile');
jest.mock('file-entry-cache', () => ({
    createFromFile: jest.fn().mockReturnValue({
        getFileDescriptor: jest.fn(),
        reconcile: jest.fn(),
        analyzeFiles: jest.fn().mockReturnValue({
            changedFiles: [],
            notFoundFiles: [],
            notChangedFiles: [],
        }),
    }),
}));

const mockReadFileInfo = jest.spyOn(fileHelper, 'readFileInfo');
jest.mock('../../util/fileHelper', () => ({ readFileInfo: jest.fn() }));

const RESULT_NO_ISSUES: CachedFileResult = {
    processed: true,
    issues: [],
    errors: 0,
    configErrors: 0,
};

describe('DiskCache', () => {
    let diskCache: DiskCache;
    let fileEntryCache: {
        getFileDescriptor: jest.Mock;
        reconcile: jest.Mock;
        analyzeFiles: jest.Mock;
    };

    beforeEach(() => {
        diskCache = new DiskCache('.foobar', false);
        fileEntryCache = mockCreateFileEntryCache.mock.results[0].value;
    });

    describe('constructor', () => {
        it('creates file-entry-cache in specified location', () => {
            expect(mockCreateFileEntryCache).toBeCalledTimes(1);
            expect(mockCreateFileEntryCache).toBeCalledWith(path.resolve('.foobar'), false);
        });
    });

    describe('getCachedLintResults', () => {
        it('returns undefined for not found files', async () => {
            fileEntryCache.getFileDescriptor.mockReturnValue({ notFound: true });
            expect(await diskCache.getCachedLintResults('file')).toEqual(undefined);
        });

        it('returns undefined for changed files', async () => {
            fileEntryCache.getFileDescriptor.mockReturnValue({ changed: true });
            expect(await diskCache.getCachedLintResults('file')).toEqual(undefined);
        });

        it('returns cached result', async () => {
            fileEntryCache.getFileDescriptor.mockReturnValue(entry(RESULT_NO_ISSUES));

            const cachedResult = await diskCache.getCachedLintResults('file');

            expect(cachedResult).toMatchObject(RESULT_NO_ISSUES);
            expect(cachedResult?.elapsedTimeMs).toBeUndefined();
            expect(cachedResult?.cached).toBe(true);

            expect(mockReadFileInfo).toHaveBeenCalledTimes(0);
            expect(cachedResult?.fileInfo.filename).toEqual('file');
        });

        it('returns cached result for empty files', async () => {
            fileEntryCache.getFileDescriptor.mockReturnValue(entry(RESULT_NO_ISSUES));

            const cachedResult = await diskCache.getCachedLintResults('file');

            expect(cachedResult).toMatchObject(RESULT_NO_ISSUES);
            expect(cachedResult?.elapsedTimeMs).toBeUndefined();
            expect(cachedResult?.cached).toBe(true);

            expect(mockReadFileInfo).toHaveBeenCalledTimes(0);
            expect(cachedResult?.fileInfo.filename).toEqual('file');
        });

        it('returns cached result for files with errors', async () => {
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

        it('with failed dependencies', async () => {
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
        it('skips not found files', () => {
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

        it('writes result and config hash to cache', () => {
            const descriptor = { meta: { data: { r: undefined } } };
            fileEntryCache.getFileDescriptor.mockReturnValue(descriptor);

            const result = {
                processed: true,
                issues: [],
                errors: 0,
                configErrors: 0,
            };
            diskCache.setCachedLintResults({ ...result, fileInfo: { filename: 'some-file' }, elapsedTimeMs: 100 }, []);

            expect(fileEntryCache.getFileDescriptor).toBeCalledWith('some-file');
            expect(descriptor.meta.data.r).toEqual(result);
        });
    });

    describe('reconcile', () => {
        it('call cache.reconcile()', () => {
            diskCache.reconcile();
            expect(fileEntryCache.reconcile).toBeCalledTimes(1);
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});

function entry(result: CachedFileResult, dependencies: string[] = [], size = 100): { meta: CSpellCacheMeta } {
    return {
        meta: {
            size,
            data: {
                r: result,
                d: dependencies,
            },
        },
    };
}
