import type { FileDescriptor, FileEntryCache } from 'file-entry-cache';
import { create as createFileEntryCache } from 'file-entry-cache';
import type { ConfigInfo, FileResult } from '../../fileHelper';
import { readFileInfo } from '../../fileHelper';
import type { CSpellLintResultCache } from './CSpellLintResultCache';
import { getConfigHash } from './getConfigHash';

type CachedFileResult = Omit<FileResult, 'fileInfo' | 'elapsedTimeMs'>;

type CSpellCacheMeta =
    | (FileDescriptor['meta'] & {
          result: CachedFileResult;
          configHash: string;
      })
    | undefined;

/**
 * Caches cspell results on disk
 */
export class DiskCache implements CSpellLintResultCache {
    private fileEntryCache: FileEntryCache;

    constructor(cacheFileLocation: string, useCheckSum: boolean) {
        this.fileEntryCache = createFileEntryCache(cacheFileLocation, undefined, useCheckSum);
    }

    public async getCachedLintResults(filename: string, configInfo: ConfigInfo): Promise<FileResult | undefined> {
        const fileDescriptor = this.fileEntryCache.getFileDescriptor(filename);
        const meta = fileDescriptor.meta as CSpellCacheMeta;

        // Cached lint results are valid if and only if:
        // 1. The file is present in the filesystem
        // 2. The file has not changed since the time it was previously linted
        // 3. The CSpell configuration has not changed since the time the file was previously linted
        // If any of these are not true, we will not reuse the lint results.
        if (
            fileDescriptor.notFound ||
            fileDescriptor.changed ||
            !meta ||
            meta.configHash !== getConfigHash(configInfo)
        ) {
            return undefined;
        }

        // Skip reading empty files and files without lint error
        const hasErrors = meta.result.errors > 0 || meta.result.configErrors > 0 || meta.result.issues.length > 0;
        const cached = !!meta.size;
        const shouldReadFile = cached && hasErrors;

        return {
            ...meta.result,
            elapsedTimeMs: undefined,
            fileInfo: shouldReadFile ? await readFileInfo(filename) : { filename },
            cached,
        };
    }

    public setCachedLintResults({ fileInfo, elapsedTimeMs: _, ...result }: FileResult, configInfo: ConfigInfo): void {
        const fileDescriptor = this.fileEntryCache.getFileDescriptor(fileInfo.filename);
        const meta = fileDescriptor.meta as CSpellCacheMeta;
        if (fileDescriptor.notFound || !meta) {
            return;
        }

        meta.result = result;
        meta.configHash = getConfigHash(configInfo);
    }

    public reconcile(): void {
        this.fileEntryCache.reconcile();
    }
}
