/* eslint-disable no-irregular-whitespace */
import * as Path from 'path';
import {
    GlobPattern,
    GlobPatternNormalized,
    GlobPatternWithOptionalRoot,
    GlobPatternWithRoot,
    PathInterface,
} from './GlobMatcherTypes';

const { posix } = Path;
const relRegExp = /^\.[\\/]/;

/**
 * This function tries its best to determine if `fileOrGlob` is a path to a file or a glob pattern.
 * @param fileOrGlob - file (with absolute path) or glob.
 * @param root - absolute path to the directory that will be considered the root when testing the glob pattern.
 * @param path - optional node path methods - used for testing
 */
export function fileOrGlobToGlob(
    fileOrGlob: string | GlobPattern,
    root: string,
    path: PathInterface = Path
): GlobPatternWithRoot {
    const pathToGlob = path.sep === '\\' ? (p: string) => p.replace(/\\/g, '/') : (p: string) => p;

    if (typeof fileOrGlob !== 'string') {
        const useRoot = fileOrGlob.root ?? root;
        return { ...fileOrGlob, root: useRoot };
    }

    if (doesRootContainPath(root, fileOrGlob, path) || relRegExp.test(fileOrGlob)) {
        const rel = path.relative(root, path.resolve(root, fileOrGlob));
        return {
            glob: pathToGlob(rel),
            root,
        };
    }
    return {
        glob: pathToGlob(fileOrGlob),
        root,
    };
}

/**
 * Decide if a childPath is contained within a root or at the same level.
 * @param root - absolute path
 * @param childPath - absolute path
 */
export function doesRootContainPath(root: string, child: string, path: PathInterface): boolean {
    if (child.startsWith(root)) return true;
    const rel = path.relative(root, child);
    return !rel || (rel !== child && !rel.startsWith('..') && !path.isAbsolute(rel));
}

export function isGlobPatternWithOptionalRoot(g: GlobPattern): g is GlobPatternWithOptionalRoot {
    return typeof g !== 'string' && typeof g.glob === 'string';
}

export function isGlobPatternWithRoot(g: GlobPatternWithRoot | GlobPatternWithOptionalRoot): g is GlobPatternWithRoot {
    return !!g.root;
}

export function isGlobPatternNormalized(g: GlobPattern | GlobPatternNormalized): g is GlobPatternNormalized {
    if (!isGlobPatternWithOptionalRoot(g)) return false;
    if (!isGlobPatternWithRoot(g)) return false;

    const gr = <GlobPatternNormalized>g;
    return 'rawGlob' in gr && 'rawRoot' in gr && typeof gr.rawGlob === 'string';
}

/**
 * @param pattern glob pattern
 * @param nested when true add `**​/<glob>/​**`
 * @returns the set of matching globs.
 */
function normalizePattern(pattern: string, nested: boolean): string[] {
    pattern = pattern.replace(/^(!!)+/, '');
    const isNeg = pattern.startsWith('!');
    const prefix = isNeg ? '!' : '';
    pattern = isNeg ? pattern.slice(1) : pattern;
    const patterns = nested ? normalizePatternNested(pattern) : normalizePatternGeneral(pattern);
    return patterns.map((p) => prefix + p);
}

function normalizePatternNested(pattern: string): string[] {
    // no slashes will match files names or folders
    if (!pattern.includes('/')) {
        if (pattern === '**') return ['**'];
        return ['**/' + pattern, '**/' + pattern + '/**'];
    }
    const hasLeadingSlash = pattern.startsWith('/');
    pattern = hasLeadingSlash ? pattern.slice(1) : pattern;

    if (pattern.endsWith('/')) {
        // legacy behavior, if it only has a trailing slash, allow matching against a nested directory.
        return hasLeadingSlash || pattern.slice(0, -1).includes('/') ? [pattern + '**/*'] : ['**/' + pattern + '**/*'];
    }

    if (pattern.endsWith('**')) {
        return [pattern];
    }

    return [pattern, pattern + '/**'];
}

function normalizePatternGeneral(pattern: string): [string] {
    pattern = pattern.startsWith('/') ? pattern.slice(1) : pattern;
    pattern = pattern.endsWith('/') ? pattern + '**/*' : pattern;
    return [pattern];
}

export interface NormalizeOptions {
    /**
     * Indicates that the glob should be modified to match nested patterns.
     *
     * Example: `node_modules` becomes `**​/node_modules/​**`, `**​/node_modules`, and `node_modules/​**`
     */
    nested: boolean;
    /**
     * This is the root to use for the glob if the glob does not already contain one.
     */
    root: string;

    /**
     * This is the replacement for `${cwd}` in either the root or in the glob.
     */
    cwd?: string;

    /**
     * Optional path interface for working with paths.
     */
    nodePath?: PathInterface;
}

/**
 *
 * @param patterns - glob patterns to normalize.
 * @param options - Normalization options.
 */
export function normalizeGlobPatterns(patterns: GlobPattern[], options: NormalizeOptions): GlobPatternNormalized[] {
    function* normalize() {
        for (const glob of patterns) {
            if (isGlobPatternNormalized(glob)) {
                yield glob;
                continue;
            }
            yield* normalizeGlobPattern(glob, options);
        }
    }

    return [...normalize()];
}

export function normalizeGlobPattern(g: GlobPattern, options: NormalizeOptions): GlobPatternNormalized[] {
    const { root, nodePath: path = Path, nested, cwd = Path.resolve() } = options;

    g = !isGlobPatternWithOptionalRoot(g) ? { glob: g } : g;

    const gr = { ...g, root: g.root ?? root };

    const rawRoot = gr.root;
    const rawGlob = g.glob;

    gr.glob = gr.glob.trim(); // trimGlob(g.glob);
    if (gr.glob.startsWith('${cwd}')) {
        gr.glob = gr.glob.replace('${cwd}', '');
        gr.root = '${cwd}';
    }
    if (gr.root.startsWith('${cwd}')) {
        gr.root = path.resolve(gr.root.replace('${cwd}', cwd));
    }
    gr.root = path.resolve(root, path.normalize(gr.root));

    const globs = normalizePattern(gr.glob, nested);
    return globs.map((glob) => ({ ...gr, glob, rawGlob, rawRoot }));
}

/**
 * Try to adjust the root of a glob to match a new root. If it is not possible, the original glob is returned.
 * Note: this does NOT generate absolutely correct glob patterns. The results are intended to be used as a
 * first pass only filter. Followed by testing against the original glob/root pair.
 * @param glob - glob to map
 * @param root - new root to use if possible
 * @param path - Node Path modules to use (testing only)
 */
export function normalizeGlobToRoot<Glob extends GlobPatternWithRoot>(
    glob: Glob,
    root: string,
    path: PathInterface
): Glob {
    function relToGlob(relativePath: string): string {
        return path.sep === '\\' ? relativePath.replace(/\\/g, '/') : relativePath;
    }

    if (glob.root === root) {
        return glob;
    }

    const relFromRootToGlob = path.relative(root, glob.root);

    if (!relFromRootToGlob) {
        return glob;
    }

    const relFromGlobToRoot = path.relative(glob.root, root);
    const globIsUnderRoot = relFromRootToGlob[0] !== '.' && !path.isAbsolute(relFromRootToGlob);
    const rootIsUnderGlob = relFromGlobToRoot[0] !== '.' && !path.isAbsolute(relFromGlobToRoot);

    // Root and Glob are not in the same part of the directory tree.
    if (!globIsUnderRoot && !rootIsUnderGlob) {
        return glob;
    }

    const isNeg = glob.glob.startsWith('!');
    const g = isNeg ? glob.glob.slice(1) : glob.glob;
    const prefix = isNeg ? '!' : '';

    // prefix with root
    if (globIsUnderRoot) {
        const relGlob = relToGlob(relFromRootToGlob);

        return {
            ...glob,
            glob: prefix + posix.join(relGlob, g),
            root,
        };
    }

    // The root is under the glob root
    // The more difficult case, the glob is higher than the root
    // A best effort is made, but does not do advanced matching.
    const relGlob = relToGlob(relFromGlobToRoot) + '/';
    const rebasedGlob = rebaseGlob(g, relGlob);

    return rebasedGlob ? { ...glob, glob: prefix + rebasedGlob, root } : glob;
}

/**
 * Rebase a glob string to a new prefix
 * @param glob - glob string
 * @param rebaseTo - glob prefix
 */
function rebaseGlob(glob: string, rebaseTo: string): string | undefined {
    if (!rebaseTo || rebaseTo === '/') return glob;
    if (glob.startsWith('**')) return glob;
    rebaseTo = rebaseTo.endsWith('/') ? rebaseTo : rebaseTo + '/';

    if (glob.startsWith(rebaseTo)) {
        return glob.slice(rebaseTo.length);
    }

    const relParts = rebaseTo.split('/');
    const globParts = glob.split('/');

    for (let i = 0; i < relParts.length && i < globParts.length; ++i) {
        const relSeg = relParts[i];
        const globSeg = globParts[i];
        // the empty segment due to the end relGlob / allows for us to test against an empty segment.
        if (!relSeg || globSeg === '**') {
            return globParts.slice(i).join('/');
        }
        if (relSeg !== globSeg && globSeg !== '*') {
            break;
        }
    }
    return undefined;
}

/**
 * Trims any trailing spaces, tabs, line-feeds, new-lines, and comments
 * @param glob - glob string
 * @returns trimmed glob
 */
function trimGlob(glob: string): string {
    glob = glob.replace(/(?<!\\)#.*/g, '');
    glob = trimGlobLeft(glob);
    glob = trimGlobRight(glob);
    return glob;
}

const spaces: Record<string, true> = {
    ' ': true,
    '\t': true,
    '\n': true,
    '\r': true,
};

/**
 * Trim any trailing spaces, tabs, line-feeds, or new-lines
 * Handles a trailing \<space>
 * @param glob - glob string
 * @returns glob string with space to the right removed.
 */
function trimGlobRight(glob: string): string {
    const lenMin1 = glob.length - 1;
    let i = lenMin1;
    while (i >= 0 && glob[i] in spaces) {
        --i;
    }
    if (glob[i] === '\\' && i < lenMin1) {
        ++i;
    }
    ++i;
    return i ? glob.slice(0, i) : '';
}

/**
 * Trim any leading spaces, tabs, line-feeds, or new-lines
 * @param glob - any string
 * @returns string with leading spaces removed.
 */
function trimGlobLeft(glob: string): string {
    let i = 0;
    while (i < glob.length && glob[i] in spaces) {
        ++i;
    }
    return glob.slice(i);
}

export const __testing__ = {
    rebaseGlob,
    trimGlob,
};
