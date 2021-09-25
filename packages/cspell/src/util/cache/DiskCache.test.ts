import { DiskCache } from './DiskCache';
import * as HashModule from './hash';
import * as FileEntryCacheModule from 'file-entry-cache';
import * as fileHelper from '../../fileHelper';

const mockHash = jest.spyOn(HashModule, 'hash');
jest.mock('./hash', () => ({
    hash: jest.fn().mockReturnValue('TEST_CONFIG_HASH'),
}));

const mockCreateFileEntryCache = jest.spyOn(FileEntryCacheModule, 'create');
jest.mock('file-entry-cache', () => ({
    create: jest.fn().mockReturnValue({
        getFileDescriptor: jest.fn(),
        reconcile: jest.fn(),
    }),
}));

jest.mock('../../../package.json', () => ({ version: '0.0.0' }));

const mockReadFileInfo = jest.spyOn(fileHelper, 'readFileInfo');
jest.mock('../../fileHelper', () => ({ readFileInfo: jest.fn() }));

const RESULT_NO_ISSUES = {
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
    };

    beforeEach(() => {
        diskCache = new DiskCache(
            '.foobar',
            {
                source: 'some-source-string-in-config-info',
                config: {},
            },
            false
        );
        fileEntryCache = mockCreateFileEntryCache.mock.results[0].value;
    });

    describe('constructor', () => {
        it('creates file-entry-cache in specified location', () => {
            expect(mockCreateFileEntryCache).toBeCalledTimes(1);
            expect(mockCreateFileEntryCache).toBeCalledWith('.foobar', undefined, false);
        });
        it('hashes version and config', () => {
            expect(mockHash).toBeCalledTimes(1);
            expect(mockHash.mock.calls[0][0]).toContain('0.0.0');
            expect(mockHash.mock.calls[0][0]).toContain('some-source-string-in-config-info');
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

        it('returns undefined for files with different config', async () => {
            fileEntryCache.getFileDescriptor.mockReturnValue({ meta: { configHash: 'OTHER_TEST_CONFIG_HASH' } });
            expect(await diskCache.getCachedLintResults('file')).toEqual(undefined);
        });

        it('returns cached result', async () => {
            fileEntryCache.getFileDescriptor.mockReturnValue({
                meta: {
                    configHash: 'TEST_CONFIG_HASH',
                    size: 100,
                    result: RESULT_NO_ISSUES,
                },
            });

            const cachedResult = await diskCache.getCachedLintResults('file');

            expect(cachedResult).toMatchObject(RESULT_NO_ISSUES);
            expect(cachedResult?.elapsedTimeMs).toEqual(0);

            expect(mockReadFileInfo).toHaveBeenCalledTimes(0);
            expect(cachedResult?.fileInfo.filename).toEqual('file');
        });

        it('returns cached result for empty files', async () => {
            fileEntryCache.getFileDescriptor.mockReturnValue({
                meta: {
                    configHash: 'TEST_CONFIG_HASH',
                    size: 0,
                    result: RESULT_NO_ISSUES,
                },
            });

            const cachedResult = await diskCache.getCachedLintResults('file');

            expect(cachedResult).toMatchObject(RESULT_NO_ISSUES);
            expect(cachedResult?.elapsedTimeMs).toEqual(0);

            expect(mockReadFileInfo).toHaveBeenCalledTimes(0);
            expect(cachedResult?.fileInfo.filename).toEqual('file');
        });

        it('returns cached result for files with errors', async () => {
            const result = { ...RESULT_NO_ISSUES, errors: 10 };
            fileEntryCache.getFileDescriptor.mockReturnValue({
                meta: {
                    configHash: 'TEST_CONFIG_HASH',
                    size: 100,
                    result,
                },
            });

            const fileInfo = { filename: 'file', text: 'file content' };
            mockReadFileInfo.mockReturnValue(Promise.resolve(fileInfo));

            const cachedResult = await diskCache.getCachedLintResults('file');

            expect(cachedResult).toMatchObject(result);
            expect(cachedResult?.elapsedTimeMs).toEqual(0);

            expect(mockReadFileInfo).toHaveBeenCalledTimes(1);
            expect(cachedResult?.fileInfo).toEqual(fileInfo);
        });
    });

    describe('setCachedLintResults', () => {
        it('skips not found files', () => {
            const descriptor = { notFound: true, meta: { result: undefined } };
            fileEntryCache.getFileDescriptor.mockReturnValue(descriptor);
            diskCache.setCachedLintResults({
                fileInfo: { filename: 'some-file' },
                processed: true,
                issues: [],
                errors: 0,
                configErrors: 0,
                elapsedTimeMs: 100,
            });

            expect(descriptor.meta.result).toBeUndefined();
        });

        it('writes result and config hash to cache', () => {
            const descriptor = { meta: { result: undefined, configHash: undefined } };
            fileEntryCache.getFileDescriptor.mockReturnValue(descriptor);

            const result = {
                processed: true,
                issues: [],
                errors: 0,
                configErrors: 0,
            };
            diskCache.setCachedLintResults({ ...result, fileInfo: { filename: 'some-file' }, elapsedTimeMs: 100 });

            expect(fileEntryCache.getFileDescriptor).toBeCalledWith('some-file');
            expect(descriptor.meta.result).toEqual(result);
            expect(descriptor.meta.configHash).toEqual('TEST_CONFIG_HASH');
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
