import path from 'path';
import stringify from 'fast-json-stable-stringify';
import type { FileEntryCache, FileDescriptor } from 'file-entry-cache';
import { create as createFileEntryCache } from 'file-entry-cache';
import type { ConfigInfo, FileResult } from '../../fileHelper';
import { readFileInfo } from '../../fileHelper';
import { hash } from './hash';
import { CSpellLintResultCache } from '.';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require(path.join(__dirname, '..', '..', '..', 'package.json'));

type CachedFileResult = Omit<FileResult, 'fileInfo' | 'elapsedTimeMs'>;
type CSpellCacheMeta = FileDescriptor['meta'] & {
    result: CachedFileResult;
    configHash: string;
};

const configHashes: WeakMap<ConfigInfo, string> = new WeakMap();

export function getConfigHash(configInfo: ConfigInfo): string {
    if (!configHashes.has(configInfo)) {
        configHashes.set(configInfo, hash(`${version}_${stringify(configInfo)}`));
    }

    return configHashes.get(configInfo)!;
}

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
        if (fileDescriptor.notFound || fileDescriptor.changed || meta.configHash !== getConfigHash(configInfo)) {
            return undefined;
        }

        // Skip reading empty files and files without lint error
        const hasErrors = meta.result.errors > 0 || meta.result.configErrors > 0 || meta.result.issues.length > 0;
        const shouldReadFile = meta.size !== 0 && hasErrors;

        return {
            ...meta.result,
            elapsedTimeMs: 0,
            fileInfo: shouldReadFile ? await readFileInfo(filename) : { filename },
        };
    }

    public setCachedLintResults({ fileInfo, elapsedTimeMs: _, ...result }: FileResult, configInfo: ConfigInfo): void {
        const fileDescriptor = this.fileEntryCache.getFileDescriptor(fileInfo.filename);
        if (fileDescriptor.notFound) {
            return;
        }

        const meta = fileDescriptor.meta as CSpellCacheMeta;
        meta.result = result;
        meta.configHash = getConfigHash(configInfo);
    }

    public reconcile(): void {
        this.fileEntryCache.reconcile();
    }
}
