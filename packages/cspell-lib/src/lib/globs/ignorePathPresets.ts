import * as path from 'node:path';

import type { CSpellSettings, GlobDef, IgnorePathPresets } from '@cspell/cspell-types';

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
 * Find the preset that ignores a file.
 *
 * @param filePath - absolute path of the file.
 * @param settings - the `ignorePathPresets` setting.
 * @returns the name of the preset that ignores the file, or `undefined`.
 */
export function findIgnorePathPreset(
    filePath: string,
    settings: IgnorePathPresets | undefined,
): keyof IgnorePathPresets | undefined {
    return settings?.git !== false && isGitFile(filePath) ? 'git' : undefined;
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
