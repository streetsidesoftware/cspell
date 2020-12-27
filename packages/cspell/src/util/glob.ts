import glob, { IGlob } from 'glob';
import * as path from 'path';
import * as fsp from 'fs-extra';
import { IOptions } from './IOptions';

export interface GlobOptions extends IOptions {
    cwd?: string;
    root?: string;
}

const defaultExcludeGlobs = ['node_modules/**'];

/**
 * Attempt to normalize a pattern based upon the root.
 * If the pattern is absolute, check to see if it exists and adjust the root, otherwise it is assumed to be based upon the current root.
 * If the pattern starts with a relative path, adjust the root to match.
 * The challenge is with the patterns that begin with `/`. Is is an absolute path or relative pattern?
 * @param pat glob pattern
 * @param root absolute path | empty
 * @returns the adjusted root and pattern.
 */
function normalizePattern(pat: string, root: string): PatternRoot {
    // Absolute pattern
    if (path.isAbsolute(pat)) {
        const dir = findBaseDir(pat);
        if (dir.length > 1 && exists(dir)) {
            // Assume it is an absolute path
            return {
                pattern: pat,
                root: path.sep,
            };
        }
    }
    // normal pattern
    if (!/^\.\./.test(pat)) {
        return {
            pattern: pat,
            root,
        };
    }
    // relative pattern
    pat = path.sep === '\\' ? pat.replace(/\\/g, '/') : pat;
    const patParts = pat.split('/');
    const rootParts = root.split(path.sep);
    let i = 0;
    for (; i < patParts.length && patParts[i] === '..'; ++i) {
        rootParts.pop();
    }
    return {
        pattern: patParts.slice(i).join('/'),
        root: rootParts.join(path.sep),
    };
}

export async function globP(pattern: string | string[], options?: GlobOptions): Promise<string[]> {
    const root = options?.root || process.cwd();
    const opts = options || {};
    const rawPatterns = typeof pattern === 'string' ? [pattern] : pattern;
    const normPatterns = rawPatterns.map((pat) => normalizePattern(pat, root));
    const globPState: GlobPState = {
        options: { ...opts },
    };

    const globResults = normPatterns.map(async (pat) => {
        globPState.options = { ...opts, root: pat.root, cwd: pat.root };
        const absolutePaths = (await _globP(pat.pattern, globPState)).map((filename) =>
            path.resolve(pat.root, filename)
        );
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

interface PatternRoot {
    pattern: string;
    root: string;
}

function findBaseDir(pat: string) {
    const globChars = /[*@()?|[\]{},]/;
    while (globChars.test(pat)) {
        pat = path.dirname(pat);
    }
    return pat;
}

function exists(filename: string): boolean {
    try {
        fsp.accessSync(filename);
    } catch (e) {
        return false;
    }

    return true;
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

export const _testing_ = {
    normalizePattern,
};
