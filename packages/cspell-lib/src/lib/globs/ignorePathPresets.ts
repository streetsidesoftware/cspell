import * as path from 'node:path';

import type { CSpellSettings, GlobDef } from '@cspell/cspell-types';

// Keeps git's message files, such as `COMMIT_EDITMSG`, for the `commit-msg` hook.
const gitIgnorePaths: GlobDef[] = [{ glob: '**/.git/!(EDIT_DESCRIPTION|*MSG)', source: 'ignorePathPresets.git' }];

/**
 * Get the globs of the enabled `ignorePathPresets`, for a file search to skip.
 *
 * The globs have no root.
 *
 * @param settings - the settings with `ignorePathPresets`.
 * @returns the globs to ignore.
 */
export function calcIgnorePaths(settings: Pick<CSpellSettings, 'ignorePathPresets'>): GlobDef[] {
    return settings.ignorePathPresets?.git === false ? [] : gitIgnorePaths;
}

/**
 * Check if the enabled `ignorePathPresets` ignore a file.
 *
 * @param filePath - absolute path of the file.
 * @param settings - the settings with `ignorePathPresets`.
 * @returns `true` if the file is ignored.
 */
export function isIgnoredByPathPresets(filePath: string, settings: Pick<CSpellSettings, 'ignorePathPresets'>): boolean {
    return settings.ignorePathPresets?.git !== false && isGitFile(filePath);
}

/**
 * A file named `.git`, which git puts in a worktree or a submodule, or a file inside a `.git` folder other than git's
 * message files directly inside it.
 */
function isGitFile(filePath: string): boolean {
    const parts = filePath.split(path.sep);
    const name = parts.pop() || '';
    if (name === '.git') return true;
    const gitFolderIndex = parts.lastIndexOf('.git');
    if (gitFolderIndex < 0) return false;
    return gitFolderIndex < parts.length - 1 || !isGitMessageFile(name);
}

function isGitMessageFile(name: string): boolean {
    return name.endsWith('MSG') || name === 'EDIT_DESCRIPTION';
}
