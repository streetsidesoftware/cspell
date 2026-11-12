import * as path from 'node:path';

import type { CSpellSettings, GlobDef } from '@cspell/cspell-types';

// Keeps git's message files, such as `COMMIT_EDITMSG`, for the `commit-msg` hook, also those of linked worktrees.
const gitIgnorePaths: GlobDef[] = [
    { glob: '**/.git/!(*MSG|EDIT_DESCRIPTION|worktrees)', source: 'ignorePathPresets.git' },
    { glob: '**/.git/worktrees/*/!(*MSG|EDIT_DESCRIPTION)', source: 'ignorePathPresets.git' },
];

/**
 * Get the globs of the enabled `ignorePathPresets`, for a file search to skip.
 *
 * The globs have no root.
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
 * @param filePath - absolute path of the file.
 * @param settings - the settings with `ignorePathPresets`.
 * @returns `true` if the file is ignored.
 */
export function isIgnoredByPresets(filePath: string, settings: Pick<CSpellSettings, 'ignorePathPresets'>): boolean {
    return settings.ignorePathPresets?.git !== false && isGitFile(filePath);
}

/**
 * A file named `.git`, which git puts in a worktree or a submodule, or a file inside a `.git` folder other than git's
 * message files. Keeps the same message files as `gitIgnorePaths`: directly inside `.git` or `.git/worktrees/<name>`.
 */
function isGitFile(filePath: string): boolean {
    const parts = path.normalize(filePath).split(path.sep);
    const name = parts.pop() || '';
    if (name === '.git') return true;
    const gitFolderIndex = parts.lastIndexOf('.git');
    if (gitFolderIndex < 0) return false;
    if (!isGitMessageFile(name)) return true;
    const folders = parts.slice(gitFolderIndex + 1);
    return !(folders.length === 0 || (folders.length === 2 && folders[0] === 'worktrees'));
}

function isGitMessageFile(name: string): boolean {
    return name.endsWith('MSG') || name === 'EDIT_DESCRIPTION';
}
