import type { CSpellSettings, GlobDef } from '@cspell/cspell-types';
import { GlobMatcher } from 'cspell-glob';

import { onClearCache } from '../events/index.js';
import { uriToFilePath } from '../util/Uri.js';

const source = 'ignorePathPresets.git';

// Anchored to the root, so git files outside the root, such as a submodule's message file, are not matched.
// Keeps git's message files, such as `COMMIT_EDITMSG`, for the `commit-msg` hook, also those of linked worktrees.
const gitIgnorePaths: GlobDef[] = [
    { glob: '/**/.git/!(*MSG|EDIT_DESCRIPTION|worktrees)', source },
    { glob: '/**/.git/worktrees/*/!(*MSG|EDIT_DESCRIPTION)', source },
];

// The `.git` file of a worktree or a submodule. Only for single files: in a search, it would also skip the `.git` folder.
const gitFile: GlobDef = { glob: '/**/.git', source };

interface GitMatchers {
    folders: GlobMatcher;
    file: GlobMatcher;
}

const matchersByRoot = new Map<string, GitMatchers>();

onClearCache(() => matchersByRoot.clear());

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
    if (settings.ignorePathPresets?.git === false) return false;
    const filename = uriToFilePath(url);
    const matchers = getGitMatchers(root);
    return matchers.folders.match(filename) || matchers.file.match(filename);
}

function getGitMatchers(root: URL): GitMatchers {
    const cached = matchersByRoot.get(root.href);
    if (cached) return cached;
    const rootPath = uriToFilePath(root);
    const options = { root: rootPath, cwd: rootPath, mode: 'exclude' } as const;
    const matchers: GitMatchers = {
        folders: new GlobMatcher(gitIgnorePaths, options),
        file: new GlobMatcher([gitFile], { ...options, extendNested: false }),
    };
    matchersByRoot.set(root.href, matchers);
    return matchers;
}
