import assert from 'assert';
import * as crypto from 'crypto';
import * as fs from 'fs';
import { dirname, isAbsolute as isAbsolutePath, relative as relativePath, resolve as resolvePath } from 'path';
import type { FileResult } from '../../util/fileHelper';
import { readFileInfo } from '../../util/fileHelper';
import type { CSpellLintResultCache } from './CSpellLintResultCache';
import type { FileDescriptor, FileEntryCache } from './fileEntryCache';
import { createFromFile, normalizePath } from './fileEntryCache';
import { ShallowObjectCollection } from './ObjectCollection';

export type CachedFileResult = Omit<FileResult, 'fileInfo' | 'elapsedTimeMs' | 'cached'>;

/**
 * This is the data cached.
 * Property names are short to help keep the cache file size small.
 */
interface CachedData {
    /** meta version + suffix */
    v?: string;
    /** results */
    r?: CachedFileResult;
    /** dependencies */
    d?: Dependency[];
}

interface Dependency {
    /** filename */
    f: string;
    /** hash of file contents */
    h?: string | undefined;
}

interface CSpellCachedMetaData {
    data?: CachedData;
}

type Meta = FileDescriptor['meta'];

export type CSpellCacheMeta = (Meta & CSpellCachedMetaData) | undefined;

type CacheDataKeys = {
    [K in keyof Required<CachedData>]: K;
};

const cacheDataKeys: CacheDataKeys = {
    v: 'v',
    r: 'r',
    d: 'd',
};

/**
 * Meta Data Version is used to detect if the structure of the meta data has changed.
 * This is used in combination with the Suffix and the version of CSpell.
 */
const META_DATA_BASE_VERSION = '1';
const META_DATA_VERSION_SUFFIX = '-' + META_DATA_BASE_VERSION + '-' + Object.keys(cacheDataKeys).join('|');

interface DependencyCacheTree {
    d?: Dependency[];
    c?: Map<string, DependencyCacheTree>;
}

/**
 * Caches cspell results on disk
 */
export class DiskCache implements CSpellLintResultCache {
    public readonly cacheFileLocation: string;
    private cacheDir: string;
    private fileEntryCache: FileEntryCache;
    private dependencyCache: Map<string, Dependency> = new Map();
    private dependencyCacheTree: DependencyCacheTree = {};
    private objectCollection = new ShallowObjectCollection<CachedData>();
    private ocCacheFileResult = new ShallowObjectCollection<CachedFileResult>();
    readonly version: string;

    constructor(
        cacheFileLocation: string,
        readonly useCheckSum: boolean,
        readonly cspellVersion: string,
        readonly useUniversalCache: boolean
    ) {
        this.cacheFileLocation = resolvePath(cacheFileLocation);
        this.cacheDir = dirname(this.cacheFileLocation);
        this.fileEntryCache = createFromFile(this.cacheFileLocation, useCheckSum, useUniversalCache);
        this.version = calcVersion(cspellVersion);
    }

    public async getCachedLintResults(filename: string): Promise<FileResult | undefined> {
        filename = normalizePath(filename);
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

        const dd = { ...data };

        if (dd.d) {
            dd.d = setTreeEntry(this.dependencyCacheTree, dd.d);
        }
        dd.r = dd.r && this.normalizeResult(dd.r);
        meta.data = this.objectCollection.get(dd);

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
        { fileInfo, elapsedTimeMs: _, cached: __, ...result }: FileResult,
        dependsUponFiles: string[]
    ): void {
        const fileDescriptor = this.fileEntryCache.getFileDescriptor(fileInfo.filename);
        const meta = fileDescriptor.meta as CSpellCacheMeta;
        if (fileDescriptor.notFound || !meta) {
            return;
        }

        const data: CachedData = this.objectCollection.get({
            v: this.version,
            r: this.normalizeResult(result),
            d: this.calcDependencyHashes(dependsUponFiles),
        });

        meta.data = data;
    }

    public reconcile(): void {
        this.fileEntryCache.reconcile();
    }

    public reset(): void {
        this.fileEntryCache.destroy();
        this.dependencyCache.clear();
        this.dependencyCacheTree = {};
        this.objectCollection = new ShallowObjectCollection<CachedData>();
        this.ocCacheFileResult = new ShallowObjectCollection<CachedFileResult>();
    }

    private normalizeResult(result: CachedFileResult): CachedFileResult {
        const { issues, processed, errors, configErrors, ...rest } = result;
        if (!Object.keys(rest).length) {
            return this.ocCacheFileResult.get(result);
        }
        return this.ocCacheFileResult.get({ issues, processed, errors, configErrors });
    }

    private calcDependencyHashes(dependsUponFiles: string[]): Dependency[] {
        dependsUponFiles.sort();

        const c = getTreeEntry(this.dependencyCacheTree, dependsUponFiles);
        if (c?.d) {
            return c.d;
        }

        const dependencies: Dependency[] = dependsUponFiles.map((f) => this.getDependency(f));

        return setTreeEntry(this.dependencyCacheTree, dependencies);
    }

    private checkDependency(dep: Dependency): boolean {
        const depFile = this.resolveFile(dep.f);
        const cDep = this.dependencyCache.get(depFile);

        if (cDep && compDep(dep, cDep)) return true;
        if (cDep) return false;

        const d = this.getFileDep(depFile);
        if (compDep(dep, d)) {
            this.dependencyCache.set(depFile, dep);
            return true;
        }
        this.dependencyCache.set(depFile, d);
        return false;
    }

    private getDependency(file: string): Dependency {
        const dep = this.dependencyCache.get(file);
        if (dep) return dep;
        const d = this.getFileDep(file);
        this.dependencyCache.set(file, d);
        return d;
    }

    private getFileDep(file: string): Dependency {
        assert(isAbsolutePath(file));
        const f = this.toRelFile(file);
        let h: string;
        try {
            const buffer = fs.readFileSync(file);
            h = this.getHash(buffer);
        } catch (e) {
            return { f };
        }
        return { f, h };
    }

    private checkDependencies(dependencies: Dependency[] | undefined): boolean {
        if (!dependencies) return false;
        for (const dep of dependencies) {
            if (!this.checkDependency(dep)) {
                return false;
            }
        }
        return true;
    }

    private getHash(buffer: Buffer): string {
        return crypto.createHash('md5').update(buffer).digest('hex');
    }

    private resolveFile(file: string): string {
        return normalizePath(resolvePath(this.cacheDir, file));
    }

    private toRelFile(file: string): string {
        return normalizePath(this.useUniversalCache ? relativePath(this.cacheDir, file) : file);
    }
}

function getTreeEntry(tree: DependencyCacheTree, keys: string[]): DependencyCacheTree | undefined {
    let r: DependencyCacheTree | undefined = tree;
    for (const k of keys) {
        r = r.c?.get(k);
        if (!r) return r;
    }
    return r;
}

function setTreeEntry(tree: DependencyCacheTree, deps: Dependency[], update = false): Dependency[] {
    let r = tree;
    for (const d of deps) {
        const k = d.f;
        if (!r.c) {
            r.c = new Map();
        }
        const cn = r.c.get(k);
        const n = cn ?? {};
        if (!cn) {
            r.c.set(k, n);
        }
        r = n;
    }
    let d = r.d;
    if (!d || (r.d && update)) {
        r.d = deps;
        d = deps;
    }
    return d;
}

function compDep(a: Dependency, b: Dependency) {
    return a.f === b.f && a.h === b.h;
}

function calcVersion(version: string): string {
    return version + META_DATA_VERSION_SUFFIX;
}

export const __testing__ = {
    calcVersion,
};
