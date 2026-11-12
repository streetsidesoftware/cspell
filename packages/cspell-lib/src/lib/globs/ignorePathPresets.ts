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
 * message files. Linked worktrees and submodules keep their message files in folders below `.git`.
 */
function isGitFile(filePath: string): boolean {
    const parts = path.normalize(filePath).split(path.sep);
    const name = parts.pop() || '';
    if (name === '.git') return true;
    return parts.includes('.git') && !isGitMessageFile(name);
}

function isGitMessageFile(name: string): boolean {
    return name.endsWith('MSG') || name === 'EDIT_DESCRIPTION';
}
