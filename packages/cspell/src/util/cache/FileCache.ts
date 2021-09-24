import path from 'path';
import stringify from 'fast-json-stable-stringify';
// cspell:word imurmurhash
import murmur from 'imurmurhash';
import { FileEntryCache, FileDescriptor, create as createFileEntryCache } from 'file-entry-cache';
import { ConfigInfo, readFileInfo } from '../../fileHelper';
import { FileResult } from '../../FileResult';
import { CSpellLintResultCache } from './CSpellLintResultCache';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require(path.join(__dirname, '..', '..', '..', 'package.json'));

type CachedFileResult = Omit<FileResult, 'fileInfo'>;
type CSpellCacheMeta = FileDescriptor['meta'] & {
    result: CachedFileResult;
    configHash: string;
};

/**
 * Hash the given string
 */
function hash(str: string): string {
    return murmur(str).result().toString(36);
}

/**
 * Caches cspell results on disk
 */
export class FileCache implements CSpellLintResultCache {
    private fileEntryCache: FileEntryCache;
    private configHash: string;

    constructor(cacheFileLocation: string, configInfo: ConfigInfo) {
        this.fileEntryCache = createFileEntryCache(cacheFileLocation);
        this.configHash = hash(`${version}_${stringify(configInfo)}`);
    }

    public async getCachedLintResults(filename: string): Promise<FileResult | undefined> {
        // Cached lint results are valid if and only if:
        // 1. The file is present in the filesystem
        // 2. The file has not changed since the time it was previously linted
        // 3. The CSpell configuration has not changed since the time the file was previously linted
        // If any of these are not true, we will not reuse the lint results.

        const fileDescriptor = this.fileEntryCache.getFileDescriptor(filename);
        const meta = fileDescriptor.meta as CSpellCacheMeta;
        const changed = fileDescriptor.changed || meta.configHash !== this.configHash;

        if (fileDescriptor.notFound || changed) {
            return undefined;
        }

        // Skip reading empty files and files without lint error
        const shouldReadFile =
            meta.size !== 0 &&
            (meta.result.errors > 0 || meta.result.configErrors > 0 || meta.result.issues.length > 0);

        const fileInfo = shouldReadFile ? await readFileInfo(filename) : { filename };

        return {
            ...meta.result,
            elapsedTimeMs: 0,
            fileInfo,
        };
    }

    public setCachedLintResults(filename: string, { fileInfo, ...result }: FileResult): void {
        const fileDescriptor = this.fileEntryCache.getFileDescriptor(filename);

        if (fileDescriptor && !fileDescriptor.notFound) {
            const meta = fileDescriptor.meta as CSpellCacheMeta;
            meta.result = result;
            meta.configHash = this.configHash;
        }
    }

    public reconcile(): void {
        this.fileEntryCache.reconcile();
    }
}
