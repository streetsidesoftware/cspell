import type { Glob } from '@cspell/cspell-types';
import type { GlobMatchOptions } from 'cspell-glob';
import { GlobMatcher } from 'cspell-glob';

import { onClearCache } from '../events/index.js';

type GlobObj = Exclude<Glob, string> | Glob[];

const excludeCache = createMatcherCache(undefined);
const filesOnlyCache = createMatcherCache({ extendNested: false });

onClearCache(() => {
    excludeCache.clear();
    filesOnlyCache.clear();
});

const emptyIgnorePaths: Glob[] = [];

export function getGlobMatcherForExcluding(glob: Glob | Glob[] | undefined): GlobMatcher {
    return excludeCache.get(glob);
}

/**
 * Like {@link getGlobMatcherForExcluding}, but a glob only matches the path it names.
 * A glob ending in `/` still matches the files inside the folder.
 */
export function getGlobMatcherForExcludingFilesOnly(glob: Glob | Glob[] | undefined): GlobMatcher {
    return filesOnlyCache.get(glob);
}

interface MatcherCache {
    get(glob: Glob | Glob[] | undefined): GlobMatcher;
    clear(): void;
}

function createMatcherCache(options: GlobMatchOptions | undefined): MatcherCache {
    const simpleGlobCache = new Map<string, GlobMatcher>();
    let globCache = new WeakMap<GlobObj, GlobMatcher>();

    function get(glob: Glob | Glob[] | undefined): GlobMatcher {
        if (!glob || (Array.isArray(glob) && !glob.length)) return getGlobMatcherGlobGlob(emptyIgnorePaths);
        return typeof glob === 'string' ? getGlobMatcherGlobString(glob) : getGlobMatcherGlobGlob(glob);
    }

    function getGlobMatcherGlobString(glob: string): GlobMatcher {
        const cached = simpleGlobCache.get(glob);
        if (cached) return cached;
        const m = new GlobMatcher(glob, options);
        simpleGlobCache.set(glob, m);
        return m;
    }

    function getGlobMatcherGlobGlob(glob: GlobObj): GlobMatcher {
        const cached = globCache.get(glob);
        if (cached) return cached;
        const m = new GlobMatcher(glob, options);
        globCache.set(glob, m);
        return m;
    }

    function clear(): void {
        globCache = new WeakMap();
        simpleGlobCache.clear();
    }

    return { get, clear };
}
