import type { FileDescriptor, FileEntryCache } from 'file-entry-cache';
import * as fileEntryCache from 'file-entry-cache';
import { resolve as resolvePath } from 'path';
import type { FileResult } from '../../util/fileHelper';
import { readFileInfo } from '../../util/fileHelper';
import type { CSpellLintResultCache } from './CSpellLintResultCache';

export type CachedFileResult = Omit<FileResult, 'fileInfo' | 'elapsedTimeMs'>;

/**
 * This is the data cached.
 * Property names are short to help keep the cache file size small.
 */
interface CachedData {
    /** results */
    r: CachedFileResult;
    /** dependencies */
    d: string[];
    /** meta version */
    v: string;
}

interface CSpellCachedMetaData {
    data?: CachedData;
}

export type CSpellCacheMeta = (FileDescriptor['meta'] & CSpellCachedMetaData) | undefined;

/**
 * Caches cspell results on disk
 */
export class DiskCache implements CSpellLintResultCache {
    private fileEntryCache: FileEntryCache;
    private changedDependencies: Set<string> = new Set();
    private knownDependencies: Set<string> = new Set();

    constructor(cacheFileLocation: string, useCheckSum: boolean, readonly version: string) {
        this.fileEntryCache = fileEntryCache.createFromFile(resolvePath(cacheFileLocation), useCheckSum);
    }

    public async getCachedLintResults(filename: string): Promise<FileResult | undefined> {
        const fileDescriptor = this.fileEntryCache.getFileDescriptor(filename);
        const meta = fileDescriptor.meta as CSpellCacheMeta;
        const data = meta?.data;
        const result = data?.r;
        const versionMatches = this.version === data?.v;

        // Cached lint results are valid if and only if:
        // 1. The file is present in the filesystem
        // 2. The file has not changed since the time it was previously linted
        // 3. The CSpell configuration has not changed since the time the file was previously linted
        // If any of these are not true, we will not reuse the lint results.
        if (
            fileDescriptor.notFound ||
            fileDescriptor.changed ||
            !meta ||
            !result ||
            !versionMatches ||
            !this.checkDependencies(data.d)
        ) {
            return undefined;
        }

        // Skip reading empty files and files without lint error
        const hasErrors = !!result && (result.errors > 0 || result.configErrors > 0 || result.issues.length > 0);
        const cached = true;
        const shouldReadFile = cached && hasErrors;

        return {
            ...result,
            elapsedTimeMs: undefined,
            fileInfo: shouldReadFile ? await readFileInfo(filename) : { filename },
            cached,
        };
    }

    public setCachedLintResults(
        { fileInfo, elapsedTimeMs: _, ...result }: FileResult,
        dependsUponFiles: string[]
    ): void {
        const fileDescriptor = this.fileEntryCache.getFileDescriptor(fileInfo.filename);
        const meta = fileDescriptor.meta as CSpellCacheMeta;
        if (fileDescriptor.notFound || !meta) {
            return;
        }

        const data: CachedData = {
            r: result,
            d: dependsUponFiles,
            v: this.version,
        };

        meta.data = data;
        this.cacheDependencies(dependsUponFiles);
    }

    public reconcile(): void {
        this.fileEntryCache.reconcile();
    }

    private cacheDependencies(files: string[]) {
        this.fileEntryCache.analyzeFiles(files);
    }

    private checkDependencies(files: string[]): boolean {
        for (const file of files) {
            if (this.changedDependencies.has(file)) {
                return false;
            }
        }
        const unknown = files.filter((f) => !this.knownDependencies.has(f));
        if (!unknown.length) {
            return true;
        }
        const { changedFiles, notFoundFiles } = this.fileEntryCache.analyzeFiles(files);
        changedFiles.map((f) => this.changedDependencies.add(f));
        unknown.forEach((f) => this.knownDependencies.add(f));
        return changedFiles.length === 0 && notFoundFiles.length === 0;
    }
}
