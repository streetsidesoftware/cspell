import glob, { IGlob } from 'glob';
import * as path from 'path';
import { IOptions } from './IOptions';
import { GlobMatcher, GlobPatternWithRoot, fileOrGlobToGlob, normalizeGlobPatterns } from 'cspell-glob';
import { CSpellUserSettings, Glob } from '@cspell/cspell-types';

export interface GlobOptions extends IOptions {
    cwd?: string;
    root?: string;
    ignore?: string | string[];
}

const defaultExcludeGlobs = ['node_modules/**'];

/**
 *
 * @param pattern - glob patterns and NOT file paths. It can be a file path turned into a glob.
 * @param options - search options.
 */
export async function globP(pattern: string | string[], options?: GlobOptions): Promise<string[]> {
    const root = options?.root || process.cwd();
    const opts = options || { root };
    const rawPatterns = typeof pattern === 'string' ? [pattern] : pattern;
    const normPatterns = rawPatterns;
    const globPState: GlobPState = {
        options: { ...opts, root },
    };

    const globResults = normPatterns.map(async (pat) => {
        globPState.options = { ...opts, root: root, cwd: root };
        const absolutePaths = (await _globP(pat, globPState)).map((filename) => path.resolve(root, filename));
        const relativeToRoot = absolutePaths.map((absFilename) => path.relative(root, absFilename));
        return relativeToRoot;
    });
    const results = (await Promise.all(globResults)).reduce((prev, next) => prev.concat(next), []);
    return results;
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
        const cb = (err: Error, matches: string[]) => {
            if (err) {
                reject(err);
            }
            resolve(matches);
        };
        const options = state.glob ? { ...state.glob, ...state.options } : state.options;
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
        const patterns = g.matcher.patterns;
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
 *
 * @param globs Glob patterns.
 * @param root
 */
export function normalizeGlobsToRoot(globs: Glob[], root: string, isExclude: boolean): string[] {
    const withRoots = globs.map((g) => {
        const source = typeof g === 'string' ? 'command line' : undefined;
        return { source, ...fileOrGlobToGlob(g, root) };
    });

    const normalized = normalizeGlobPatterns(withRoots, { root, nested: isExclude, nodePath: path });
    const filteredGlobs = normalized.filter((g) => g.root === root).map((g) => g.glob);
    return filteredGlobs;
}
