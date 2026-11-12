import type { Glob } from '@cspell/cspell-types';
import type { GlobPatternWithRoot } from 'cspell-glob';
import { GlobMatcher, isGlobPatternNormalized } from 'cspell-glob';

import { onClearCache } from '../events/index.js';

type GlobObj = Exclude<Glob, string> | Glob[];

const simpleGlobCache = new Map<string, GlobMatcher>();
let globCache = new WeakMap<GlobObj, GlobMatcher>();
let filesOnlyCache = new WeakMap<GlobMatcher, GlobMatcher>();

onClearCache(() => {
    globCache = new WeakMap();
    filesOnlyCache = new WeakMap();
    simpleGlobCache.clear();
});

const emptyIgnorePaths: Glob[] = [];

export function getGlobMatcherForExcluding(glob: Glob | Glob[] | undefined): GlobMatcher {
    if (!glob || (Array.isArray(glob) && !glob.length)) return getGlobMatcherGlobGlob(emptyIgnorePaths);
    return typeof glob === 'string' ? getGlobMatcherGlobString(glob) : getGlobMatcherGlobGlob(glob);
}

/**
 * Like {@link getGlobMatcherForExcluding}, but a glob only matches the path it names:
 * - `name` and `dir/name` no longer match the files inside a folder with that name.
 * - `dir/**` no longer matches a file named `dir`.
 * - `dir/` still matches the files inside `dir`.
 */
export function getGlobMatcherForExcludingFilesOnly(glob: Glob | Glob[] | undefined): GlobMatcher {
    const matcher = getGlobMatcherForExcluding(glob);
    const cached = filesOnlyCache.get(matcher);
    if (cached) return cached;
    const m = new GlobMatcher(toFilesOnlyPatterns(matcher.patterns), { ...matcher.options, nested: false });
    filesOnlyCache.set(matcher, m);
    return m;
}

function getGlobMatcherGlobString(glob: string): GlobMatcher {
    const cached = simpleGlobCache.get(glob);
    if (cached) return cached;
    const m = new GlobMatcher(glob);
    simpleGlobCache.set(glob, m);
    return m;
}

function getGlobMatcherGlobGlob(glob: GlobObj): GlobMatcher {
    const cached = globCache.get(glob);
    if (cached) return cached;
    const m = new GlobMatcher(glob);
    globCache.set(glob, m);
    return m;
}

/**
 * Rewrite the patterns of an exclude matcher, so that a glob only matches the path it names.
 *
 * The exclude matcher expands each glob that does not end in `/` or `**` into the glob itself, followed by
 * `<glob>/**` for the folder's contents. Those expansions are dropped.
 *
 * The result keeps each pattern's root and `isGlobalPattern`, and is meant for a matcher with `nested: false`.
 * Its patterns are not marked as normalized, so the matcher does not move them to its own root.
 */
function toFilesOnlyPatterns(patterns: readonly GlobPatternWithRoot[]): GlobPatternWithRoot[] {
    const result: GlobPatternWithRoot[] = [];
    let prev: GlobPatternWithRoot | undefined;
    for (const pattern of patterns) {
        const isFolderContents = prev && isSameSource(prev, pattern) && pattern.glob === prev.glob + '/**';
        prev = pattern;
        if (isFolderContents) continue;
        const { glob, root, isGlobalPattern, source, line } = pattern;
        result.push({ glob: glob.endsWith('/**') ? glob + '/*' : glob, root, isGlobalPattern, source, line });
    }
    return result;
}

function isSameSource(a: GlobPatternWithRoot, b: GlobPatternWithRoot): boolean {
    if (!isGlobPatternNormalized(a) || !isGlobPatternNormalized(b)) return false;
    return a.rawGlob === b.rawGlob && a.rawRoot === b.rawRoot && a.root === b.root;
}
