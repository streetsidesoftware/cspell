import {
    GlobPattern,
    GlobPatternNormalized,
    GlobPatternWithOptionalRoot,
    GlobPatternWithRoot,
    PathInterface,
} from './GlobMatcherTypes';
import * as Path from 'path';

const { posix } = Path;
const { relative } = posix;

/**
 * This function tries its best to determine if `fileOrGlob` is a path to a file or a glob pattern.
 * @param fileOrGlob - file (with absolute path) or glob.
 * @param root - absolute path to the directory that will be considered the root when testing the glob pattern.
 * @param path - optional node path methods - used for testing
 */
export function fileOrGlobToGlob(fileOrGlob: string, root: string, path: PathInterface = Path): GlobPatternWithRoot {
    const pathToGlob = path.sep === '\\' ? (p: string) => p.replace(/\\/g, '/') : (p: string) => p;

    if (fileOrGlob.startsWith(root)) {
        const rel = path.relative(root, fileOrGlob);
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

type MutationsToSupportGitIgnore = [RegExp, string];

const mutationsNestedOnly: MutationsToSupportGitIgnore[] = [
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
    return patterns
        .map((g) => normalizeGlobPatternWithRoot(g, options))
        .map((g) => mapGlobToRoot(g, options.root))
        .filter(isNotUndefined);
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

function makeRelative(from: string, to: string): string {
    const rel = relative(from.replace(/\\/g, '/'), to.replace(/\\/g, '/'));
    return rel;
}

function mapGlobToRoot(glob: GlobPatternNormalized, root: string): GlobPatternNormalized | undefined {
    if (glob.root === root) {
        return glob;
    }

    const globIsUnderRoot = glob.root.startsWith(root);
    const rootIsUnderGlob = root.startsWith(glob.root);

    // Root and Glob are not in the same part of the directory tree.
    if (!globIsUnderRoot && !rootIsUnderGlob) return undefined;

    // prefix with root
    if (globIsUnderRoot) {
        const rel = makeRelative(root, glob.root);

        return {
            ...glob,
            glob: posix.join(rel, glob.glob),
            root,
        };
    }

    // The root is under the glob root
    // The more difficult case, the glob is higher than the root
    // A best effort is made, but does not do advanced matching.

    // no slashes matches everything "*.json"

    if (glob.glob.startsWith('**')) return { ...glob, root };

    const rel = makeRelative(glob.root, root) + '/';
    if (glob.glob.startsWith(rel)) {
        return { ...glob, glob: glob.glob.slice(rel.length), root };
    }

    const relParts = rel.split('/');
    const globParts = glob.glob.split('/');

    for (let i = 0; i < relParts.length && i < globParts.length; ++i) {
        const relSeg = relParts[i];
        const globSeg = globParts[i];
        // the trailing / allows for us to test against an empty segment.
        if (!relSeg || globSeg === '**') {
            return { ...glob, glob: globParts.slice(i).join('/'), root };
        }
        if (relSeg !== globSeg && globSeg !== '*') {
            break;
        }
    }

    return glob;
}

function isNotUndefined<T>(a: T | undefined): a is T {
    return a !== undefined;
}
