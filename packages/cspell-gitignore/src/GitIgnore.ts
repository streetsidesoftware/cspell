import * as path from 'path';
import { contains } from '.';
import { GitIgnoreHierarchy, loadGitIgnore } from './GitIgnoreFile';

/**
 * Class to cache and process `.gitignore` file queries.
 */
export class GitIgnore {
    private resolvedGitIgnoreHierarchies = new Map<string, GitIgnoreHierarchy>();
    private knownGitIgnoreHierarchies = new Map<string, Promise<GitIgnoreHierarchy>>();
    readonly roots: string[];

    /**
     * @param roots - (search roots) an optional array of root paths to prevent searching for `.gitignore` files above the root.
     *   If a file is under multiple roots, the closest root will apply. If a file is not under any root, then
     *   the search for `.gitignore` will go all the way to the system root of the file.
     */
    constructor(roots: string[] = []) {
        this.roots = roots.map((a) => path.resolve(a));
        this.roots.sort((a, b) => a.length - b.length);
        Object.freeze(this.roots);
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

    async filterOutIgnored(files: string[]): Promise<string[]> {
        const result: string[] = [];

        for (const file of files) {
            const isIgnored = this.isIgnoredQuick(file) ?? (await this.isIgnored(file));
            if (!isIgnored) {
                result.push(file);
            }
        }

        return result;
    }

    private async _findGitIgnoreHierarchy(directory: string): Promise<GitIgnoreHierarchy> {
        const root = this.determineRoot(directory);
        const parent = path.dirname(directory);
        const parentHierarchy =
            parent !== directory && contains(root, parent) ? await this.findGitIgnoreHierarchy(parent) : undefined;
        const gif = await loadGitIgnore(directory);
        if (!gif) {
            return parentHierarchy || new GitIgnoreHierarchy([]);
        }
        const chain = parentHierarchy?.gitIgnoreChain.concat([gif]) ?? [gif];
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
