import { GlobMatcher } from 'cspell-glob';
import { promises as fs } from 'fs';
import * as path from 'path';

/**
 * Represents an instance of a .gitignore file.
 */
export class GitIgnoreFile {
    constructor(readonly matcher: GlobMatcher, readonly gitignore: string) {
        this.gitignore = path.join(matcher.root, '.gitignore');
    }

    get root(): string {
        return this.matcher.root;
    }

    isIgnored(file: string): boolean {
        return this.matcher.match(file);
    }

    static async loadGitignore(gitignore: string): Promise<GitIgnoreFile> {
        const content = await fs.readFile(gitignore, 'utf8');
        const options = { root: path.dirname(gitignore) };
        const globMatcher = new GlobMatcher(content, options);
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
        for (const gif of this.gitIgnoreChain) {
            if (gif.isIgnored(file)) return true;
        }

        return false;
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
