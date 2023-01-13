import type { GlobMatchRule, GlobPatternNormalized, GlobPatternWithRoot } from 'cspell-glob';
import { GlobMatcher } from 'cspell-glob';
import { promises as fs } from 'fs';
import * as path from 'path';

import { isDefined, isParentOf, makeRelativeTo } from './helpers';

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

    getGlobPatters(): GlobPatternWithRoot[] {
        return this.matcher.patterns;
    }

    getGlobs(relativeTo: string): string[] {
        return this.getGlobPatters()
            .map((pat) => globToString(pat, relativeTo))
            .filter(isDefined);
    }

    static parseGitignore(content: string, gitignoreFilename: string): GitIgnoreFile {
        const options = { root: path.dirname(gitignoreFilename) };
        const globs = content
            .split('\n')
            .map((glob, index) => ({
                glob: glob.replace(/#.*/, '').trim(),
                source: gitignoreFilename,
                line: index + 1,
            }))
            .filter((g) => !!g.glob);
        const globMatcher = new GlobMatcher(globs, options);
        return new GitIgnoreFile(globMatcher, gitignoreFilename);
    }

    static async loadGitignore(gitignore: string): Promise<GitIgnoreFile> {
        gitignore = path.resolve(gitignore);
        const content = await fs.readFile(gitignore, 'utf8');
        return this.parseGitignore(content, gitignore);
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

    getGlobPatters(): GlobPatternWithRoot[] {
        return this.gitIgnoreChain.flatMap((gf) => gf.getGlobPatters());
    }

    getGlobs(relativeTo: string): string[] {
        return this.gitIgnoreChain.flatMap((gf) => gf.getGlobs(relativeTo));
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

function globToString(glob: GlobPatternWithRoot, relativeTo: string): string | undefined {
    if (glob.isGlobalPattern) return glob.glob;

    if (isParentOf(glob.root, relativeTo) && glob.glob.startsWith('**/')) return glob.glob;

    const base = makeRelativeTo(glob.root, relativeTo);
    if (base === undefined) return undefined;
    return (base ? base + '/' : '') + glob.glob;
}

export const __testing__ = {
    mustBeHierarchical,
};
