import * as path from 'path';

import { contains } from '.';
import type { IsIgnoredExResult } from './GitIgnoreFile';
import { GitIgnoreHierarchy, loadGitIgnore } from './GitIgnoreFile';

/**
 * Class to cache and process `.gitignore` file queries.
 */
export class GitIgnore {
    private resolvedGitIgnoreHierarchies = new Map<string, GitIgnoreHierarchy>();
    private knownGitIgnoreHierarchies = new Map<string, Promise<GitIgnoreHierarchy>>();
    private _roots: Set<string>;
    private _sortedRoots: string[];

    /**
     * @param roots - (search roots) an optional array of root paths to prevent searching for `.gitignore` files above the root.
     *   If a file is under multiple roots, the closest root will apply. If a file is not under any root, then
     *   the search for `.gitignore` will go all the way to the system root of the file.
     */
    constructor(roots: string[] = []) {
        this._sortedRoots = resolveAndSortRoots(roots);
        this._roots = new Set(this._sortedRoots);
    }

    findResolvedGitIgnoreHierarchy(directory: string): GitIgnoreHierarchy | undefined {
        return this.resolvedGitIgnoreHierarchies.get(directory);
    }

    isIgnoredQuick(file: string): boolean | undefined {
        const gh = this.findResolvedGitIgnoreHierarchy(path.dirname(file));
        return gh?.isIgnored(file);
    }

    async isIgnored(file: string): Promise<boolean> {
        const gh = await this.findGitIgnoreHierarchy(path.dirname(file));
        return gh.isIgnored(file);
    }

    async isIgnoredEx(file: string): Promise<IsIgnoredExResult | undefined> {
        const gh = await this.findGitIgnoreHierarchy(path.dirname(file));
        return gh.isIgnoredEx(file);
    }

    async findGitIgnoreHierarchy(directory: string): Promise<GitIgnoreHierarchy> {
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

    addRoots(roots: string[]): void {
        const rootsToAdd = roots.map((p) => path.resolve(p)).filter((r) => !this._roots.has(r));
        if (!rootsToAdd.length) return;

        rootsToAdd.forEach((r) => this._roots.add(r));
        this._sortedRoots = resolveAndSortRoots([...this._roots]);
        this.cleanCachedEntries();
    }

    peekGitIgnoreHierarchy(directory: string): Promise<GitIgnoreHierarchy> | undefined {
        return this.knownGitIgnoreHierarchies.get(directory);
    }

    private cleanCachedEntries() {
        this.knownGitIgnoreHierarchies.clear();
        this.resolvedGitIgnoreHierarchies.clear();
    }

    private async _findGitIgnoreHierarchy(directory: string): Promise<GitIgnoreHierarchy> {
        const root = this.determineRoot(directory);
        const parent = path.dirname(directory);
        const parentHierarchy =
            parent !== directory && contains(root, parent) ? await this.findGitIgnoreHierarchy(parent) : undefined;
        const git = await loadGitIgnore(directory);
        if (!git) {
            return parentHierarchy || new GitIgnoreHierarchy([]);
        }
        const chain = parentHierarchy?.gitIgnoreChain.concat([git]) ?? [git];
        return new GitIgnoreHierarchy(chain);
    }

    private determineRoot(directory: string): string {
        const roots = this.roots;
        for (let i = roots.length - 1; i >= 0; --i) {
            const r = roots[i];
            if (contains(r, directory)) return r;
        }
        return path.parse(directory).root;
    }
}

function resolveAndSortRoots(roots: string[]): string[] {
    const sortedRoots = roots.map((a) => path.resolve(a));
    sortRoots(sortedRoots);
    Object.freeze(sortedRoots);
    return sortedRoots;
}

/**
 * Sorts root paths based upon their length.
 * @param roots - array to be sorted
 */
function sortRoots(roots: string[]): string[] {
    roots.sort((a, b) => a.length - b.length);
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
