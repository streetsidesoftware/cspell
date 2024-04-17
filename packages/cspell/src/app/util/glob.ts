import { promises as fs } from 'node:fs';
import * as path from 'node:path';
import { posix } from 'node:path';

import type { CSpellUserSettings, Glob } from '@cspell/cspell-types';
import type { GlobPatternWithRoot } from 'cspell-glob';
import { fileOrGlobToGlob, GlobMatcher } from 'cspell-glob';
import type { Options as FastGlobOptions } from 'fast-glob';
import glob from 'fast-glob';

import { clean } from './util.js';

/**
 * This is a subset of IOptions from 'glob'.
 */
export interface GlobOptions {
    cwd?: string | undefined;
    root?: string | undefined;
    dot?: boolean | undefined;
    nodir?: boolean | undefined; // cspell:ignore nodir
    ignore?: string | Array<string> | undefined;
}

const defaultExcludeGlobs = ['node_modules/**'];

/**
 *
 * @param pattern - glob patterns and NOT file paths. It can be a file path turned into a glob.
 * @param options - search options.
 */
export async function globP(pattern: string | string[], options?: GlobOptions): Promise<string[]> {
    const cwd = options?.root || options?.cwd || process.cwd();
    const ignore = typeof options?.ignore === 'string' ? [options.ignore] : options?.ignore;
    const onlyFiles = options?.nodir;
    const dot = options?.dot;
    const patterns = typeof pattern === 'string' ? [pattern] : pattern;
    const useOptions: FastGlobOptions = clean({
        cwd,
        onlyFiles,
        dot,
        ignore,
        absolute: true,
        followSymbolicLinks: false,
    });

    const compare = new Intl.Collator('en').compare;
    const absolutePaths = (await glob(patterns, useOptions)).sort(compare);
    const relativePaths = absolutePaths.map((absFilename) => path.relative(cwd, absFilename));
    return relativePaths;
}

export function calcGlobs(commandLineExclude: string[] | undefined): { globs: string[]; source: string } {
    const globs = new Set(
        (commandLineExclude || []).flatMap((glob) => glob.split(/(?<!\\)\s+/g)).map((g) => g.replace(/\\ /g, ' ')),
    );
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
    const urls = globs.filter((g): g is string => typeof g === 'string' && isPossibleUrlRegExp.test(g));
    const onlyGlobs = globs.filter((g) => typeof g !== 'string' || !isPossibleUrlRegExp.test(g));
    return [urls, extractGlobsFromMatcher(buildGlobMatcher(onlyGlobs, root, isExclude))].flatMap((a) => a);
}

const isPossibleGlobRegExp = /[*{}()?[]/;
const isPossibleUrlRegExp = /^[-a-z_0-9]{3,}:\/\//;

/**
 * If a 'glob' is a path to a directory, then append `**` so that
 * directory searches work.
 * @param glob - a glob, file, or directory
 * @param root - root to use.
 * @returns `**` is appended directories.
 */
async function adjustPossibleDirectory(glob: Glob, root: string): Promise<Glob> {
    const g =
        typeof glob === 'string'
            ? {
                  glob,
                  root,
              }
            : {
                  glob: glob.glob,
                  root: glob.root ?? root,
              };

    // Do not ask the file system to look up obvious glob patterns.
    if (isPossibleGlobRegExp.test(g.glob)) {
        return glob;
    }

    if (isPossibleUrlRegExp.test(g.glob)) {
        return glob;
    }

    const dirPath = path.resolve(g.root, g.glob);
    try {
        const stat = await fs.stat(dirPath);
        if (stat.isDirectory()) {
            const useGlob = posix.join(posixPath(g.glob), '**');
            return typeof glob === 'string' ? useGlob : { ...glob, glob: useGlob };
        }
    } catch {
        // it was not possible to access the dirPath, no problem, just let the file glob search look for it.
        return glob;
    }
    return glob;
}

function posixPath(p: string): string {
    return path.sep === '\\' ? p.replace(/\\/g, '/') : p;
}

export async function normalizeFileOrGlobsToRoot(globs: Glob[], root: string): Promise<string[]> {
    const adjustedGlobs = await Promise.all(globs.map((g) => adjustPossibleDirectory(g, root)));
    return normalizeGlobsToRoot(adjustedGlobs, root, false);
}
