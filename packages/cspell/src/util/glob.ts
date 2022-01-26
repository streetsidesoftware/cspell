import type { CSpellUserSettings, Glob } from '@cspell/cspell-types';
import { fileOrGlobToGlob, GlobMatcher, GlobPatternWithRoot } from 'cspell-glob';
import glob from 'glob';
import * as path from 'path';

/**
 * This is a subset of IOptions from 'glob'.
 */
export interface GlobOptions {
    cwd?: string | undefined;
    root?: string | undefined;
    dot?: boolean | undefined;
    nodir?: boolean | undefined; // cspell:ignore nodir
    ignore?: string | ReadonlyArray<string> | undefined;
}

type IGlob = ReturnType<typeof glob>;

const defaultExcludeGlobs = ['node_modules/**'];

// Note this is to allow experimenting with using a single glob
const useJoinPatterns = process.env['CSPELL_SINGLE_GLOB'];

/**
 *
 * @param pattern - glob patterns and NOT file paths. It can be a file path turned into a glob.
 * @param options - search options.
 */
export async function globP(pattern: string | string[], options?: GlobOptions): Promise<string[]> {
    const root = options?.root || process.cwd();
    const opts = options || { root };
    const rawPatterns = typeof pattern === 'string' ? [pattern] : pattern;
    const normPatterns = useJoinPatterns ? joinPatterns(rawPatterns) : rawPatterns;
    const globPState: GlobPState = {
        options: { ...opts, root },
    };

    const globResults = normPatterns.map(async (pat) => {
        globPState.options = { ...opts, root: root, cwd: root };
        const absolutePaths = (await _globP(pat, globPState)).map((filename) => path.resolve(root, filename));
        const relativeToRoot = absolutePaths.map((absFilename) => path.relative(root, absFilename));
        return relativeToRoot;
    });
    const results = new Set(flatten(await Promise.all(globResults)));
    return [...results];
}

function joinPatterns(globs: string[]): string[] {
    return globs.length <= 1 ? globs : [`{${globs.join(',')}}`];
}

interface GlobPState {
    options: GlobOptions;
    glob?: IGlob;
}

function _globP(pattern: string, state: GlobPState): Promise<string[]> {
    if (!pattern) {
        return Promise.resolve([]);
    }
    return new Promise<string[]>((resolve, reject) => {
        const cb = (err: Error | null | undefined, matches: string[]) => {
            if (err) {
                reject(err);
            }
            resolve(matches);
        };
        const options = { ...(state.glob || {}), ...state.options };
        state.glob = glob(pattern, options, cb);
    });
}

export function calcGlobs(commandLineExclude: string[] | undefined): { globs: string[]; source: string } {
    const globs = (commandLineExclude || [])
        .map((glob) => glob.split(/(?<!\\)\s+/g))
        .map((globs) => globs.map((g) => g.replace(/\\ /g, ' ')))
        .reduce((s, globs) => {
            globs.forEach((g) => s.add(g));
            return s;
        }, new Set<string>());
    const commandLineExcludes = {
        globs: [...globs],
        source: 'arguments',
    };
    const defaultExcludes = {
        globs: defaultExcludeGlobs,
        source: 'default',
    };

    return commandLineExcludes.globs.length ? commandLineExcludes : defaultExcludes;
}

export interface GlobSrcInfo {
    matcher: GlobMatcher;
    source: string;
}

interface ExtractPatternResult {
    glob: GlobPatternWithRoot;
    source: string;
}

export function extractPatterns(globs: GlobSrcInfo[]): ExtractPatternResult[] {
    const r = globs.reduce((info: ExtractPatternResult[], g: GlobSrcInfo) => {
        const source = g.source;
        const patterns = g.matcher.patternsNormalizedToRoot;
        return info.concat(patterns.map((glob) => ({ glob, source })));
    }, []);

    return r;
}

export function calcExcludeGlobInfo(root: string, commandLineExclude: string[] | string | undefined): GlobSrcInfo[] {
    commandLineExclude = typeof commandLineExclude === 'string' ? [commandLineExclude] : commandLineExclude;
    const choice = calcGlobs(commandLineExclude);
    const matcher = new GlobMatcher(choice.globs, { root, dot: true });
    return [
        {
            matcher,
            source: choice.source,
        },
    ];
}

export function extractGlobExcludesFromConfig(root: string, source: string, config: CSpellUserSettings): GlobSrcInfo[] {
    if (!config.ignorePaths || !config.ignorePaths.length) {
        return [];
    }
    const matcher = new GlobMatcher(config.ignorePaths, { root, dot: true });
    return [{ source, matcher }];
}

/**
 * Build GlobMatcher from command line or config file globs.
 * @param globs Glob patterns or file paths
 * @param root - directory to use as the root
 */
export function buildGlobMatcher(globs: Glob[], root: string, isExclude: boolean): GlobMatcher {
    const withRoots = globs.map((g) => {
        const source = typeof g === 'string' ? 'command line' : undefined;
        return { source, ...fileOrGlobToGlob(g, root) };
    });

    return new GlobMatcher(withRoots, { root, mode: isExclude ? 'exclude' : 'include' });
}

export function extractGlobsFromMatcher(globMatcher: GlobMatcher): string[] {
    return globMatcher.patternsNormalizedToRoot.map((g) => g.glob);
}

export function normalizeGlobsToRoot(globs: Glob[], root: string, isExclude: boolean): string[] {
    return extractGlobsFromMatcher(buildGlobMatcher(globs, root, isExclude));
}

function* flatten<T>(src: Iterable<T | T[]>): IterableIterator<T> {
    for (const item of src) {
        if (Array.isArray(item)) {
            yield* item;
        } else {
            yield item;
        }
    }
}
