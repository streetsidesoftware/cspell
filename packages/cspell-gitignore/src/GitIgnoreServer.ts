import * as path from 'path';
import { GitIgnoreHierarchy, loadGitIgnore } from './GitIgnoreFile';

export class GitIgnore {
    private resolvedGitIgnoreHierarchies = new Map<string, GitIgnoreHierarchy>();
    private knownGitIgnoreHierarchies = new Map<string, Promise<GitIgnoreHierarchy>>();

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
        const parent = path.dirname(directory);
        const parentHierarchy = parent !== directory ? await this.findGitIgnoreHierarchy(parent) : undefined;
        const gif = await loadGitIgnore(directory);
        if (!gif) {
            return parentHierarchy || new GitIgnoreHierarchy([]);
        }
        const chain = parentHierarchy?.gitIgnoreChain.concat([gif]) ?? [gif];
        return new GitIgnoreHierarchy(chain);
    }
}
