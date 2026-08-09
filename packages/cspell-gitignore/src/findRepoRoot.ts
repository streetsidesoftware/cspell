import { toFileDirURL, toFilePathOrHref } from '@cspell/url';
import type { VFileSystem } from 'cspell-io';
import { getDefaultVirtualFs } from 'cspell-io';

/**
 * Find the git repository root directory.
 * @param directory - directory to search up from.
 * @returns resolves to `.git` root or undefined
 */
export async function findRepoRoot(directory: string | URL, vfs?: VFileSystem): Promise<string | undefined> {
    const from = toFileDirURL(directory);
    const fs = vfs || getDefaultVirtualFs().getFS(from);
    const found = await fs.findUp((dir) => findDotGit(fs, dir), from);
    if (!found) return undefined;
    return toFilePathOrHref(new URL('.', found));
}

/**
 * Look for `.git` in a single directory, without caring whether it is a file or a directory.
 *
 * A clone marks its root with a `.git` directory and a worktree marks its root with a `.git` file,
 * so both have to count. A worktree checked out inside its own clone has one of each above it,
 * which is why the nearest match has to win rather than one type of match.
 * @param fs - file system to stat with.
 * @param dir - directory to look in.
 * @returns resolves to the url of `.git`, or undefined when the directory does not have one.
 */
function findDotGit(fs: VFileSystem, dir: URL): Promise<URL | undefined> {
    const url = new URL('.git', dir);
    return fs.stat(url).then(
        () => url,
        () => undefined,
    );
}
