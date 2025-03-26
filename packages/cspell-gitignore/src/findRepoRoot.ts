import { toFileDirURL, toFilePathOrHref } from '@cspell/url';
import { getDefaultVirtualFs, type VFileSystem } from 'cspell-io';

/**
 * Find the git repository root directory.
 * @param directory - directory to search up from.
 * @returns resolves to `.git` root or undefined
 */
export async function findRepoRoot(directory: string | URL, vfs?: VFileSystem): Promise<string | undefined> {
    directory = toFileDirURL(directory);
    vfs = vfs || getDefaultVirtualFs().getFS(directory);
    const foundDir = await vfs.findUp('.git', directory, { type: 'directory' });
    const foundFile = await vfs.findUp('.git', directory, { type: 'file' });
    const found = foundDir || foundFile;
    if (!found) return undefined;
    return toFilePathOrHref(new URL('.', found));
}
