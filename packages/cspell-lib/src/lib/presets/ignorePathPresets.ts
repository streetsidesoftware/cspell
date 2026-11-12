import type { CSpellSettings, GlobDef } from '@cspell/cspell-types';

const source = 'ignorePathPresets.git';

// Anchored to the root, so git files outside the root, such as a submodule's message file, are not matched.
// Keeps git's message files, such as `COMMIT_EDITMSG`, for the `commit-msg` hook, also those of linked worktrees.
// `isGitFileInRoot` checks the same files.
const gitIgnorePaths: GlobDef[] = [
    { glob: '/**/.git/!(*MSG|EDIT_DESCRIPTION|worktrees)', source },
    { glob: '/**/.git/worktrees/*/!(*MSG|EDIT_DESCRIPTION)', source },
];

/**
 * Get the globs of the enabled `ignorePathPresets`, for a file search to skip.
 *
 * The globs have no root. They match only below the root they are resolved against.
 *
 * @param settings - the settings with `ignorePathPresets`.
 * @returns the globs to ignore.
 */
export function calcIgnorePathGlobs(settings: Pick<CSpellSettings, 'ignorePathPresets'>): GlobDef[] {
    return settings.ignorePathPresets?.git === false ? [] : gitIgnorePaths;
}

/**
 * Check if the enabled `ignorePathPresets` ignore a file.
 *
 * @param url - the URL of the file.
 * @param root - the URL of the folder the presets apply to. Files outside it are not ignored.
 * @param settings - the settings with `ignorePathPresets`.
 * @returns `true` if the file is ignored.
 */
export function isIgnoredByPresets(url: URL, root: URL, settings: Pick<CSpellSettings, 'ignorePathPresets'>): boolean {
    return settings.ignorePathPresets?.git !== false && isGitFileInRoot(url, root);
}

/**
 * The same files as `gitIgnorePaths`, plus a file named `.git`, which git puts in a worktree or a submodule.
 * The `.git` file is not in the globs, because in a search a glob for it would also skip the `.git` folder.
 */
function isGitFileInRoot(url: URL, root: URL): boolean {
    if (url.protocol !== root.protocol || url.host !== root.host) return false;
    const rootPath = root.pathname.endsWith('/') ? root.pathname : root.pathname + '/';
    const pathname = url.pathname;
    if (!pathname.startsWith(rootPath)) return false;
    const relPath = pathname.slice(rootPath.length);
    if (!relPath.includes('.git')) return false;
    const parts = relPath.split('/');
    if (parts[parts.length - 1] === '.git') return true;
    const gitFolderIndex = parts.indexOf('.git');
    if (gitFolderIndex < 0) return false;
    // The entry in `.git`, and for `.git/worktrees/<name>/`, the entry in the worktree's folder.
    const entry = parts[gitFolderIndex + 1];
    if (entry !== 'worktrees') return !isGitMessageFile(entry);
    const worktreeEntry = parts[gitFolderIndex + 3];
    return worktreeEntry !== undefined && !isGitMessageFile(worktreeEntry);
}

function isGitMessageFile(name: string): boolean {
    return name.endsWith('MSG') || name === 'EDIT_DESCRIPTION';
}
