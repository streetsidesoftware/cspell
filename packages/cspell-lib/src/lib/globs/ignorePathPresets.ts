import type { CSpellSettings, Glob, GlobDef, IgnorePathPresets } from '@cspell/cspell-types';
import { GlobMatcher } from 'cspell-glob';

import { onClearCache } from '../events/index.js';
import { ENV_CSPELL_GLOB_ROOT } from '../Settings/constants.js';

type PresetName = keyof IgnorePathPresets;

interface PresetGlobs {
    /** Added to `ignorePaths`, so a file search can skip whole folders. */
    ignorePaths: string[];
    /** Files only skipped when deciding whether to check a document, so they are reported as skipped. */
    files: string[];
}

/**
 * The leading `/` ties a glob to the folder cspell runs from: a glob that starts with `**` matches everywhere.
 */
const presets: Record<PresetName, PresetGlobs> = {
    git: {
        // Keeps git's message files, such as `COMMIT_EDITMSG`, for the `commit-msg` hook.
        ignorePaths: ['/**/.git/!(EDIT_DESCRIPTION|*MSG)'],
        // The `.git` file in a worktree or a submodule.
        files: ['/**/.git'],
    },
};

const presetNames = Object.keys(presets) as PresetName[];

interface PresetMatchers {
    ignorePaths: GlobMatcher;
    files: GlobMatcher;
}

const matcherCache = new Map<string, PresetMatchers>();

onClearCache(() => matcherCache.clear());

/**
 * Get the globs to ignore: `ignorePaths` plus the folders ignored by `ignorePathPresets`.
 *
 * Use it to skip folders when searching for files to check. Deciding whether to check a file still needs the full
 * settings, because some presets ignore single files.
 *
 * @param settings - the settings with `ignorePaths` and `ignorePathPresets`.
 * @returns the globs to ignore.
 */
export function calcIgnorePaths(settings: Pick<CSpellSettings, 'ignorePaths' | 'ignorePathPresets'>): Glob[] {
    const root = presetRoot();
    const presetGlobs = enabledPresets(settings.ignorePathPresets).flatMap((name) =>
        presets[name].ignorePaths.map((glob): GlobDef => ({ glob, root, source: `ignorePathPresets.${name}` })),
    );
    return [...(settings.ignorePaths ?? []), ...presetGlobs];
}

/**
 * Find the preset that ignores a file.
 *
 * The preset globs are relative to the folder cspell runs from, so a file outside that folder is never ignored.
 *
 * @param filePath - absolute path of the file.
 * @param settings - the `ignorePathPresets` setting.
 * @returns the name of the preset that ignores the file, or `undefined`.
 */
export function findIgnorePathPreset(
    filePath: string,
    settings: IgnorePathPresets | undefined,
): PresetName | undefined {
    const root = presetRoot();
    for (const name of enabledPresets(settings)) {
        const matchers = getPresetMatchers(name, root);
        if (matchers.ignorePaths.match(filePath) || matchers.files.match(filePath)) return name;
    }
    return undefined;
}

function enabledPresets(settings: IgnorePathPresets | undefined): PresetName[] {
    return presetNames.filter((name) => settings?.[name] !== false);
}

/** The folder cspell runs from: `--root` on the command line sets `CSPELL_GLOB_ROOT`. */
function presetRoot(): string {
    return process.env[ENV_CSPELL_GLOB_ROOT] || process.cwd();
}

function getPresetMatchers(name: PresetName, root: string): PresetMatchers {
    const key = name + '|' + root;
    const cached = matcherCache.get(key);
    if (cached) return cached;
    const { ignorePaths, files } = presets[name];
    const matchers: PresetMatchers = {
        ignorePaths: new GlobMatcher(ignorePaths, { root, mode: 'exclude' }),
        files: new GlobMatcher(files, { root, mode: 'include', dot: true }),
    };
    matcherCache.set(key, matchers);
    return matchers;
}
