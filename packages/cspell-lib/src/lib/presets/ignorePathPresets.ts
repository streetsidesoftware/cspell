import type { CSpellSettings, GlobDef } from '@cspell/cspell-types';
import { toFileDirURL } from '@cspell/url';

import { getFileSystem } from '../fileSystem.js';
import { findNestedWorktrees } from './nestedWorktrees.js';

const source = 'ignorePathPresets.git';
const nestedWorktreesSource = 'ignorePathPresets.nestedWorktrees';

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
 * The globs have no root. Resolve them against `root`: they match only below it.
 *
 * @param settings - the settings with `ignorePathPresets`.
 * @param root - the URL of the folder the globs apply to.
 * @returns the globs to ignore.
 */
export async function calcIgnorePathGlobs(
    settings: Pick<CSpellSettings, 'ignorePathPresets'>,
    root: URL,
): Promise<GlobDef[]> {
    const presets = settings.ignorePathPresets;
    const globs = presets?.git === false ? [] : gitIgnorePaths;
    if (presets?.nestedWorktrees === false) return globs;
    const rootDir = toFileDirURL(root);
    const worktrees = await findNestedWorktrees(rootDir, getFileSystem());
    if (!worktrees.length) return globs;
    const worktreeGlobs = worktrees.map((folder) => ({
        glob: '/' + escapeGlobPath(decodeURIComponent(folder.href.slice(rootDir.href.length))) + '**',
        source: nestedWorktreesSource,
    }));
    return [...globs, ...worktreeGlobs];
}

/**
 * Escape the glob symbols in a path, like tinyglobby's `escapePath`.
 *
 * Each symbol becomes a character class, such as `[(]`, because on Windows globs are normalized by turning `\` into
 * `/`. A `]` needs no escape once every `[` is escaped, and `!`, `+`, and `@` are symbols only before `(`.
 */
function escapeGlobPath(path: string): string {
    return path.replaceAll(/[()[{}*?|]/g, '[$&]');
}

/**
 * Check if the enabled `ignorePathPresets` ignore a file, by its path alone.
 *
 * Nested worktrees are not checked. The globs from {@link calcIgnorePathGlobs} skip them.
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
    const rootHref = root.href.endsWith('/') ? root.href : root.href + '/';
    const href = url.href;
    if (!href.startsWith(rootHref)) return false;
    const relPath = href.slice(rootHref.length);
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
