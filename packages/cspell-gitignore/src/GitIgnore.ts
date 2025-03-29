import { toFileDirURL, toFileURL, urlDirname } from '@cspell/url';
import type { VFileSystem } from 'cspell-io';

import type { IsIgnoredExResult } from './GitIgnoreFile.js';
import { GitIgnoreHierarchy, loadGitIgnore } from './GitIgnoreFile.js';
import { isParentOf } from './utils.js';

/**
 * Class to cache and process `.gitignore` file queries.
 */
export class GitIgnore {
    private resolvedGitIgnoreHierarchies = new Map<string, GitIgnoreHierarchy>();
    private knownGitIgnoreHierarchies = new Map<string, Promise<GitIgnoreHierarchy>>();
    private _roots: Set<string>;
    private _sortedRoots: string[];
    private _vfs: VFileSystem | undefined;

    /**
     * @param roots - (search roots) an optional array of root paths to prevent searching for `.gitignore` files above the root.
     *   If a file is under multiple roots, the closest root will apply. If a file is not under any root, then
     *   the search for `.gitignore` will go all the way to the system root of the file.
     */
    constructor(roots: (string | URL)[] = [], vfs?: VFileSystem) {
        this._vfs = vfs;
        this._sortedRoots = resolveAndSortRoots(roots);
        this._roots = new Set(this._sortedRoots);
    }

    findResolvedGitIgnoreHierarchy(directory: string | URL): GitIgnoreHierarchy | undefined {
        return this.resolvedGitIgnoreHierarchies.get(toFileDirURL(directory).href);
    }

    isIgnoredQuick(file: string | URL): boolean | undefined {
        const uFile = toFileURL(file);
        const gh = this.findResolvedGitIgnoreHierarchy(getDir(uFile));
        return gh?.isIgnored(uFile);
    }

    async isIgnored(file: string | URL): Promise<boolean> {
        const uFile = toFileURL(file);
        const gh = await this.findGitIgnoreHierarchy(getDir(uFile));
        return gh.isIgnored(uFile);
    }

    async isIgnoredEx(file: string | URL): Promise<IsIgnoredExResult | undefined> {
        const uFile = toFileURL(file);
        const gh = await this.findGitIgnoreHierarchy(getDir(uFile));
        return gh.isIgnoredEx(uFile);
    }

    async findGitIgnoreHierarchy(directory: string | URL): Promise<GitIgnoreHierarchy> {
        directory = toFileDirURL(directory).href;
        const known = this.knownGitIgnoreHierarchies.get(directory);
        if (known) {
            return known;
        }
        const find = this._findGitIgnoreHierarchy(directory);
        this.knownGitIgnoreHierarchies.set(directory, find);
        const found = await find;
        this.resolvedGitIgnoreHierarchies.set(directory, found);
        return find;
    }

    filterOutIgnored(files: string[]): Promise<string[]>;
    filterOutIgnored(files: Iterable<string>): Promise<string[]>;
    filterOutIgnored(files: AsyncIterable<string>): AsyncIterable<string>;
    filterOutIgnored(files: Iterable<string> | AsyncIterable<string>): Promise<string[]> | AsyncIterable<string>;
    filterOutIgnored(files: Iterable<string> & AsyncIterable<string>): AsyncIterable<string>;
    filterOutIgnored(files: Iterable<string> | AsyncIterable<string>): Promise<string[]> | AsyncIterable<string> {
        const iter = this.filterOutIgnoredAsync(files);
        return isAsyncIterable(files) ? iter : asyncIterableToArray(iter);
    }

    async *filterOutIgnoredAsync(files: Iterable<string> | AsyncIterable<string>): AsyncIterable<string> {
        for await (const file of files) {
            const isIgnored = this.isIgnoredQuick(file) ?? (await this.isIgnored(file));
            if (!isIgnored) {
                yield file;
            }
        }
    }

    get roots(): string[] {
        return this._sortedRoots;
    }

    addRoots(roots: (string | URL)[]): void {
        const rootsToAdd = roots.map((r) => toFileDirURL(r).href).filter((r) => !this._roots.has(r));
        if (!rootsToAdd.length) return;

        rootsToAdd.forEach((r) => this._roots.add(r));
        this._sortedRoots = resolveAndSortRoots([...this._roots]);
        this.cleanCachedEntries();
    }

    peekGitIgnoreHierarchy(directory: string | URL): Promise<GitIgnoreHierarchy> | undefined {
        directory = toFileDirURL(directory).href;
        return this.knownGitIgnoreHierarchies.get(directory);
    }

    async getGlobs(directory: string): Promise<string[]> {
        const hierarchy = await this.findGitIgnoreHierarchy(directory);
        return hierarchy.getGlobs(directory);
    }

    private cleanCachedEntries() {
        this.knownGitIgnoreHierarchies.clear();
        this.resolvedGitIgnoreHierarchies.clear();
    }

    private async _findGitIgnoreHierarchy(directory: string | URL): Promise<GitIgnoreHierarchy> {
        directory = toFileDirURL(directory);
        const root = this.determineRoot(directory);
        const parent = urlDirname(directory);
        const parentHierarchy =
            parent.href !== directory.href && isParentOf(root, parent)
                ? await this.findGitIgnoreHierarchy(parent)
                : undefined;
        const git = await loadGitIgnore(directory, this._vfs);
        if (!git) {
            return parentHierarchy || new GitIgnoreHierarchy([]);
        }
        const chain = parentHierarchy ? [...parentHierarchy.gitIgnoreChain, git] : [git];
        return new GitIgnoreHierarchy(chain);
    }

    private determineRoot(directory: string | URL): string {
        const uDir = toFileDirURL(directory);
        const roots = this.roots;
        for (let i = roots.length - 1; i >= 0; --i) {
            const r = roots[i];
            if (uDir.href.startsWith(r)) return r;
        }
        return uDir.pathname.startsWith('/') ? new URL('/', uDir).href : uDir.href;
    }
}

/**
 * Convert the roots into urls strings.
 * @param roots
 * @returns
 */
function resolveAndSortRoots(roots: (string | URL)[]): string[] {
    const sortedRoots = roots.map((a) => toFileDirURL(a).href);
    sortRoots(sortedRoots);
    Object.freeze(sortedRoots);
    return sortedRoots;
}

function getDir(file: string | URL): URL {
    return urlDirname(toFileURL(file));
}

/**
 * Sorts root paths based upon their length.
 * @param roots - array to be sorted
 */
function sortRoots(roots: string[]): string[] {
    roots.sort((a, b) => a.length - b.length || a.localeCompare(b));
    return roots;
}

function isAsyncIterable<T>(i: Iterable<T> | AsyncIterable<T>): i is AsyncIterable<T> {
    const as = <AsyncIterable<T>>i;
    return typeof as[Symbol.asyncIterator] === 'function';
}

async function asyncIterableToArray<T>(iter: Iterable<T> | AsyncIterable<T>): Promise<Awaited<T>[]> {
    const r: Awaited<T>[] = [];

    for await (const t of iter) {
        r.push(t);
    }
    return r;
}
