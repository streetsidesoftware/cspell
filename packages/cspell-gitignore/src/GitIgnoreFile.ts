import { toFileDirURL, toFilePathOrHref, toFileURL, urlDirname } from '@cspell/url';
import type { GlobMatchRule, GlobPatternNormalized, GlobPatternWithRoot } from 'cspell-glob';
import { GlobMatcher } from 'cspell-glob';
import { getDefaultVirtualFs, VFileSystem } from 'cspell-io';

import { isDefined, isParentOf, makeRelativeTo } from './utils.js';

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
    constructor(
        readonly matcher: GlobMatcher,
        readonly gitignore: string | URL,
    ) {}

    get root(): string {
        return this.matcher.root;
    }

    isIgnored(file: string | URL): boolean {
        return this.matcher.match(file.toString());
    }

    isIgnoredEx(file: string | URL): IsIgnoredExResult {
        const m = this.matcher.matchEx(file.toString());
        const { matched } = m;
        const partial: Partial<GlobMatchRule> = m;
        const pattern: Partial<GlobPatternNormalized> | undefined = partial.pattern;
        const glob = pattern?.rawGlob ?? partial.glob;
        const root = partial.root;
        const line = pattern?.line;
        return { glob, matched, gitIgnoreFile: toFilePathOrHref(this.gitignore), root, line };
    }

    getGlobPatters(): GlobPatternWithRoot[] {
        return this.matcher.patterns;
    }

    getGlobs(relativeToDir: string | URL): string[] {
        return this.getGlobPatters()
            .map((pat) => globToString(pat, relativeToDir))
            .filter(isDefined);
    }

    static parseGitignore(content: string, gitignoreFilename: string | URL): GitIgnoreFile {
        gitignoreFilename = toFileURL(gitignoreFilename);
        const root = urlDirname(gitignoreFilename).href;
        const options = { root };
        const globs = content
            .split(/\r?\n/g)
            .map((glob, index) => ({
                glob: glob.replace(/^#.*/, ''),
                source: gitignoreFilename.toString(),
                line: index + 1,
            }))
            .filter((g) => !!g.glob);
        const globMatcher = new GlobMatcher(globs, options);
        return new GitIgnoreFile(globMatcher, gitignoreFilename);
    }

    static async loadGitignore(gitignore: string | URL, vfs: VFileSystem): Promise<GitIgnoreFile> {
        gitignore = toFileURL(gitignore);
        const file = await vfs.readFile(gitignore, 'utf8');
        return this.parseGitignore(file.getText(), gitignore);
    }
}

/**
 * A collection of nested GitIgnoreFiles to be evaluated from top to bottom.
 */
export class GitIgnoreHierarchy {
    constructor(readonly gitIgnoreChain: GitIgnoreFile[]) {
        mustBeHierarchical(gitIgnoreChain);
    }

    isIgnored(file: string | URL): boolean {
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
    isIgnoredEx(file: string | URL): IsIgnoredExResult | undefined {
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

export async function loadGitIgnore(dir: string | URL, vfs?: VFileSystem): Promise<GitIgnoreFile | undefined> {
    try {
        dir = toFileDirURL(dir);
        vfs ??= getDefaultVirtualFs().getFS(dir);
        const file = new URL('.gitignore', dir);
        return await GitIgnoreFile.loadGitignore(file, vfs);
    } catch {
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

function globToString(glob: GlobPatternWithRoot, relativeToDir: string | URL): string | undefined {
    if (glob.isGlobalPattern) return glob.glob;

    relativeToDir = toFileDirURL(relativeToDir);

    const root = toFileDirURL(glob.root);

    if (isParentOf(root, relativeToDir) && glob.glob.startsWith('**/')) return glob.glob;

    const base = makeRelativeTo(root, relativeToDir);
    if (base === undefined) return undefined;
    return (base ? base + '/' : '') + glob.glob;
}

export const __testing__ = {
    mustBeHierarchical,
};
