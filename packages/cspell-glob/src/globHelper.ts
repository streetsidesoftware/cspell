import {
    GlobPattern,
    GlobPatternNormalized,
    GlobPatternWithOptionalRoot,
    GlobPatternWithRoot,
    PathInterface,
} from './GlobMatcherTypes';
import * as Path from 'path';

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
        return { root, ...fileOrGlob };
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

type MutationsToSupportGitIgnore = [RegExp, string];

const mutationsNestedOnly: MutationsToSupportGitIgnore[] = [
    [/^[/]([^/]*)$/, '{$1,$1/**}'], // Only a leading slash will match root files and directories.
    [/^[^/#][^/]*$/, '**/{$&,$&/**}'], // no slashes will match files names or folders
    [/^[^/#][^/]*\/$/, '**/$&**/*'], // ending slash, should match any nested directory
];

const mutationsGeneral: MutationsToSupportGitIgnore[] = [
    [/^\//, ''], // remove leading slash to match from the root
    [/\/$/, '$&**/*'], // if it ends in a slash, make sure matches the folder
];

const mutationsNested = mutationsNestedOnly.concat(mutationsGeneral);

export function isGlobPatternWithOptionalRoot(g: GlobPattern): g is GlobPatternWithOptionalRoot {
    return typeof g !== 'string' && typeof g.glob === 'string';
}

export function isGlobPatternWithRoot(g: GlobPatternWithRoot | GlobPatternWithOptionalRoot): g is GlobPatternWithRoot {
    return !!g.root;
}

function normalizePattern(pattern: string, nested: boolean): string {
    pattern = pattern.replace(/^(!!)+/, '');
    const isNeg = pattern.startsWith('!');
    pattern = isNeg ? pattern.slice(1) : pattern;
    const mutations = nested ? mutationsNested : mutationsGeneral;
    pattern = mutations.reduce((p, [regex, replace]) => p.replace(regex, replace), pattern);
    return isNeg ? '!' + pattern : pattern;
}

export interface NormalizeOptions {
    nested: boolean;
    root: string;
    nodePath: PathInterface;
}

/**
 *
 * @param patterns - glob patterns to normalize.
 * @param options - Normalization options.
 */
export function normalizeGlobPatterns(patterns: GlobPattern[], options: NormalizeOptions): GlobPatternNormalized[] {
    return patterns.map((g) => normalizeGlobPatternWithRoot(g, options));
}

function normalizeGlobPatternWithRoot(g: GlobPattern, options: NormalizeOptions): GlobPatternNormalized {
    const { root, nodePath: path, nested } = options;

    g = !isGlobPatternWithOptionalRoot(g)
        ? {
              glob: g.trim(),
              root,
          }
        : g;

    const gr = isGlobPatternWithRoot(g) ? { ...g } : { ...g, root };
    if (gr.root.startsWith('${cwd}')) {
        gr.root = path.join(path.resolve(), gr.root.replace('${cwd}', ''));
    }
    gr.root = path.resolve(root, path.normalize(gr.root));
    gr.glob = normalizePattern(gr.glob, nested);

    const gn: GlobPatternNormalized = { ...gr, rawGlob: g.glob, rawRoot: g.root };
    return gn;
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

export function isGlobPatternNormalized(p: GlobPatternWithRoot | GlobPatternNormalized): p is GlobPatternNormalized {
    return (<GlobPatternNormalized>p).rawGlob !== undefined;
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

export const __testing__ = {
    rebaseGlob,
};
