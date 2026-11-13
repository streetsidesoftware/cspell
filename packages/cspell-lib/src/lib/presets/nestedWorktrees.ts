import { toFileDirURL, toFileURL } from '@cspell/url';
import type { VFileSystem } from 'cspell-io';

/**
 * Find the linked worktrees inside a folder.
 *
 * They are read from the records of the repository that holds the folder, so no folder is searched.
 * Worktrees of other repositories are not found.
 *
 * @param root - the folder to look in.
 * @param fs - the file system to read with.
 * @returns the worktree folders inside `root`, not including `root` itself.
 */
export async function findNestedWorktrees(root: URL, fs: VFileSystem): Promise<URL[]> {
    const rootDir = toFileDirURL(root);
    const gitDir = await findGitDir(rootDir, fs);
    if (!gitDir) return [];
    // A linked worktree's git folder points to the main repository's git folder, which holds the records.
    const commonDir = (await readGitPath(new URL('commondir', gitDir), gitDir, fs)) ?? gitDir;
    const recordsDir = new URL('worktrees/', toFileDirURL(commonDir));
    const records = await fs.readDirectory(recordsDir).catch(() => []);
    const folders = await Promise.all(
        records
            .filter((record) => record.isDirectory())
            .map((record) => readWorktreeFolder(new URL(encodeURIComponent(record.name) + '/', recordsDir), fs)),
    );
    return folders.filter(
        (folder): folder is URL => !!folder && folder.href.startsWith(rootDir.href) && folder.href !== rootDir.href,
    );
}

/**
 * Find the git folder of the repository or worktree that holds a folder.
 * @returns the git folder, or undefined when the folder is not in a repository.
 */
async function findGitDir(dir: URL, fs: VFileSystem): Promise<URL | undefined> {
    const dotGit = await fs.findUp((d) => ifExists(new URL('.git', d), fs), dir);
    if (!dotGit) return undefined;
    const stat = await fs.stat(dotGit);
    if (stat.isDirectory()) return toFileDirURL(dotGit);
    // A worktree or a submodule has a `.git` file that points to its git folder.
    const gitDir = await readGitPath(dotGit, new URL('.', dotGit), fs);
    return gitDir && toFileDirURL(gitDir);
}

/**
 * Read the record of a linked worktree.
 * @param recordDir - the worktree's folder in `.git/worktrees`.
 * @returns the worktree's folder, or undefined when it no longer exists.
 */
async function readWorktreeFolder(recordDir: URL, fs: VFileSystem): Promise<URL | undefined> {
    const dotGit = await readGitPath(new URL('gitdir', recordDir), recordDir, fs);
    // A worktree deleted without git keeps its record until `git worktree prune`.
    return dotGit && (await ifExists(dotGit, fs)) ? new URL('.', dotGit) : undefined;
}

/**
 * Read a path from one of git's files: a `.git` file (`gitdir: <path>`), `commondir`, or a worktree's `gitdir`.
 * @param file - the file to read.
 * @param relativeTo - the folder a relative path is relative to.
 * @returns the path as a URL, or undefined when the file cannot be read.
 */
async function readGitPath(file: URL, relativeTo: URL, fs: VFileSystem): Promise<URL | undefined> {
    const text = await fs.readFile(file, 'utf8').then(
        (f) => f.getText(),
        () => undefined,
    );
    const gitPath = text?.replace(/^gitdir:/, '').trim();
    return gitPath ? toFileURL(gitPath, relativeTo) : undefined;
}

function ifExists(url: URL, fs: VFileSystem): Promise<URL | undefined> {
    return fs.stat(url).then(
        () => url,
        () => undefined,
    );
}

// cspell:ignore commondir
