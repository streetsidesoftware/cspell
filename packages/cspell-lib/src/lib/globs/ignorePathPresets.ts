import * as path from 'node:path';

import type { IgnorePathPresets } from '@cspell/cspell-types';

import { ENV_CSPELL_GLOB_ROOT } from '../Settings/constants.js';

/**
 * Check if a file is ignored by `ignorePathPresets`.
 *
 * Only the part of the path below `root` counts, and a file outside `root` is never ignored.
 *
 * @param filePath - absolute path of the file.
 * @param presets - the `ignorePathPresets` setting. A preset that is not set keeps its default.
 * @param root - the folder cspell runs from, `CSPELL_GLOB_ROOT` or the current working directory by default.
 * @returns the name of the preset that ignores the file, or `undefined`.
 */
export function isIgnoredByPathPresets(
    filePath: string,
    presets: IgnorePathPresets | undefined,
    root: string = process.env[ENV_CSPELL_GLOB_ROOT] || process.cwd(),
): keyof IgnorePathPresets | undefined {
    if (presets?.git === false) return undefined;
    const relPath = path.relative(path.resolve(root), path.resolve(filePath));
    if (!relPath || relPath === '..' || relPath.startsWith('..' + path.sep) || path.isAbsolute(relPath)) {
        return undefined;
    }
    const parts = relPath.split(path.sep);
    const name = parts.pop() || '';
    if (name === '.git') return 'git';
    const gitFolderIndex = parts.indexOf('.git');
    if (gitFolderIndex < 0) return undefined;
    return gitFolderIndex === parts.length - 1 && isGitMessageFile(name) ? undefined : 'git';
}

/**
 * The files git writes a message to for the user to edit, such as `COMMIT_EDITMSG`.
 * Only the ones directly inside a `.git` folder are kept: the file search does not look deeper.
 */
function isGitMessageFile(name: string): boolean {
    return name.endsWith('MSG') || name === 'EDIT_DESCRIPTION';
}
