import { promises as fs } from 'fs';
import * as path from 'path';
import type { GlobMatchRule, GlobPatternNormalized } from 'cspell-glob';
import { GlobMatcher } from 'cspell-glob';

export interface IsIgnoredExResult {
    glob: string | undefined;
    root: string | undefined;
    matched: boolean;
    gitIgnoreFile: string;
    line: number | undefined;
}

/**
 * Represents an instance of a .gitignore file.
 */
export class GitIgnoreFile {
    constructor(readonly matcher: GlobMatcher, readonly gitignore: string) {}

    get root(): string {
        return this.matcher.root;
    }

    isIgnored(file: string): boolean {
        return this.matcher.match(file);
    }

    isIgnoredEx(file: string): IsIgnoredExResult {
        const m = this.matcher.matchEx(file);
        const { matched } = m;
        const partial: Partial<GlobMatchRule> = m;
        const pattern: Partial<GlobPatternNormalized> | undefined = partial.pattern;
        const glob = pattern?.rawGlob ?? partial.glob;
        const root = partial.root;
        const line = pattern?.line;
        return { glob, matched, gitIgnoreFile: this.gitignore, root, line };
    }

    static async loadGitignore(gitignore: string): Promise<GitIgnoreFile> {
        gitignore = path.resolve(gitignore);
        const content = await fs.readFile(gitignore, 'utf8');
        const options = { root: path.dirname(gitignore) };
        const globs = content.split('\n').map((glob, index) => ({
            glob,
            source: gitignore,
            line: index + 1,
        }));
        const globMatcher = new GlobMatcher(globs, options);
        return new GitIgnoreFile(globMatcher, gitignore);
    }
}

/**
 * A collection of nested GitIgnoreFiles to be evaluated from top to bottom.
 */
export class GitIgnoreHierarchy {
    constructor(readonly gitIgnoreChain: GitIgnoreFile[]) {
        mustBeHierarchical(gitIgnoreChain);
    }

    isIgnored(file: string): boolean {
        for (const git of this.gitIgnoreChain) {
            if (git.isIgnored(file)) return true;
        }

        return false;
    }

    /**
     * Check to see which `.gitignore` file ignored the given file.
     * @param file - fsPath to check.
     * @returns IsIgnoredExResult of the match or undefined if there was no match.
     */
    isIgnoredEx(file: string): IsIgnoredExResult | undefined {
        for (const git of this.gitIgnoreChain) {
            const r = git.isIgnoredEx(file);
            if (r.matched) return r;
        }

        return undefined;
    }
}

export async function loadGitIgnore(dir: string): Promise<GitIgnoreFile | undefined> {
    const file = path.join(dir, '.gitignore');
    try {
        return await GitIgnoreFile.loadGitignore(file);
    } catch (e) {
        return undefined;
    }
}

function mustBeHierarchical(chain: GitIgnoreFile[]): void {
    let root = '';
    for (const file of chain) {
        if (!file.root.startsWith(root)) {
            throw new Error('Hierarchy violation - files are not nested');
        }
        root = file.root;
    }
}

export const __testing__ = {
    mustBeHierarchical,
};
