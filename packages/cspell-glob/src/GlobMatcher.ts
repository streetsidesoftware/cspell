import mm = require('micromatch');
import * as Path from 'path';
const { posix } = Path;
const { relative } = posix;
import {
    PathInterface,
    GlobMatch,
    GlobPattern,
    GlobPatternWithRoot,
    GlobPatternNormalized,
    GlobPatternWithOptionalRoot,
} from './GlobMatcherTypes';

// cspell:ignore fname

export type GlobMatchOptions = Partial<NormalizedGlobMatchOptions>;

export type MatcherMode = 'exclude' | 'include';

interface NormalizedGlobMatchOptions {
    /**
     * The matcher has two modes (`include` or `exclude`) that impact how globs behave.
     *
     * `include` - designed for searching for file. By default it matches a sub-set of file.
     *   In include mode, the globs need to be more explicit to match.
     * - `dot` is by default false.
     * - `nested` is by default false.
     *
     * `exclude` - designed to emulate `.gitignore`. By default it matches a larger range of files.
     * - `dot` is by default true.
     * - `nested` is by default true.
     *
     * @default: 'exclude'
     */
    mode: MatcherMode;

    /**
     * The default directory from which a glob is relative.
     * Any globs that are not relative to the root will ignored.
     * @default: process.cwd()
     */
    root: string;

    /**
     * Allows matching against directories with a leading `.`.
     *
     * @default: mode == 'exclude'
     */
    dot: boolean;

    /**
     * Allows matching against nested directories or files without needing to add `**`
     *
     * @default: mode == 'exclude'
     */
    nested: boolean;

    /**
     * Mostly used for testing purposes. It allows explicitly specifying `path.win32` or `path.posix`.
     *
     * @default: require('path')
     */
    nodePath: PathInterface;
}

export class GlobMatcher {
    /**
     * @param filename full path of file to match against.
     * @returns a GlobMatch - information about the match.
     */
    readonly matchEx: (filename: string) => GlobMatch;
    readonly path: PathInterface;
    readonly patterns: GlobPatternWithRoot[];
    readonly root: string;
    readonly dot: boolean;
    readonly options: NormalizedGlobMatchOptions;

    /**
     * Construct a `.gitignore` emulator
     * @param patterns - the contents of a `.gitignore` style file or an array of individual glob rules.
     * @param root - the working directory
     */
    constructor(patterns: GlobPattern | GlobPattern[], root?: string, nodePath?: PathInterface);

    /**
     * Construct a `.gitignore` emulator
     * @param patterns - the contents of a `.gitignore` style file or an array of individual glob rules.
     * @param options - to set the root and other options
     */
    constructor(patterns: GlobPattern | GlobPattern[], options?: GlobMatchOptions);
    constructor(patterns: GlobPattern | GlobPattern[], rootOrOptions?: string | GlobMatchOptions);

    constructor(
        patterns: GlobPattern | GlobPattern[],
        rootOrOptions?: string | GlobMatchOptions,
        _nodePath?: PathInterface
    ) {
        _nodePath = _nodePath ?? Path;

        const options =
            typeof rootOrOptions === 'string' ? { root: rootOrOptions, nodePath: _nodePath } : rootOrOptions ?? {};
        const { mode = 'exclude' } = options;
        const isExcludeMode = mode !== 'include';

        const {
            root = _nodePath.resolve(),
            dot = isExcludeMode,
            nodePath = _nodePath,
            nested = isExcludeMode,
        } = options;

        const normalizedRoot = nodePath.resolve(nodePath.normalize(root));
        this.options = { root: normalizedRoot, dot, nodePath, nested, mode };

        patterns = Array.isArray(patterns)
            ? patterns
            : typeof patterns === 'string'
            ? patterns.split(/\r?\n/g)
            : [patterns];
        const globPatterns = normalizeGlobPatterns(patterns, this.options)
            // Only keep globs that do not match the root when using exclude mode.
            .filter((g) => isExcludeMode || g.root === normalizedRoot);

        this.patterns = globPatterns;
        this.root = normalizedRoot;
        this.path = nodePath;
        this.dot = dot;
        this.matchEx = buildMatcherFn(this.patterns, this.options);
    }

    /**
     * Check to see if a filename matches any of the globs.
     * If filename is relative, it is considered relative to the root.
     * If filename is absolute and contained within the root, it will be made relative before being tested for a glob match.
     * If filename is absolute and not contained within the root, it will be tested as is.
     * @param filename full path of the file to check.
     */
    match(filename: string): boolean {
        return this.matchEx(filename).matched;
    }
}

type GlobMatchFn = (filename: string) => GlobMatch;

interface GlobRule {
    glob: string;
    root: string;
    index: number;
    isNeg: boolean;
    reg: RegExp;
    fn: (filename: string) => boolean;
}

/**
 * This function attempts to emulate .gitignore functionality as much as possible.
 *
 * The resulting matcher function: (filename: string) => GlobMatch
 *
 * If filename is relative, it is considered relative to the root.
 * If filename is absolute and contained within the root, it will be made relative before being tested for a glob match.
 * If filename is absolute and not contained within the root, it will return a GlobMatchNoRule.
 *
 * @param patterns - the contents of a .gitignore style file or an array of individual glob rules.
 * @param options - defines root and other options
 * @returns a function given a filename returns true if it matches.
 */
function buildMatcherFn(patterns: GlobPatternWithRoot[], options: NormalizedGlobMatchOptions): GlobMatchFn {
    const path = options.nodePath;
    const rules: GlobRule[] = patterns
        .map((p, index) => ({ ...p, index }))
        .filter((r) => !!r.glob)
        .filter((r) => !r.glob.startsWith('#'))
        .map(({ glob, root, index }) => {
            const matchNeg = glob.match(/^!/);
            const pattern = glob.replace(/^!/, '');
            const isNeg = (matchNeg && matchNeg[0].length & 1 && true) || false;
            const reg = mm.makeRe(pattern, { dot: options.dot });
            const fn = (filename: string) => {
                const match = filename.match(reg);
                return !!match;
            };
            return { glob, root, index, isNeg, fn, reg };
        });
    const negRules = rules.filter((r) => r.isNeg);
    const posRules = rules.filter((r) => !r.isNeg);
    const fn: GlobMatchFn = (filename: string) => {
        filename = path.resolve(path.normalize(filename));

        function testRules(rules: GlobRule[], matched: boolean): GlobMatch | undefined {
            for (const rule of rules) {
                if (!filename.startsWith(rule.root)) {
                    continue;
                }
                const relName = path.relative(rule.root, filename);
                const fname = relName.split(path.sep).join('/');
                if (rule.fn(fname)) {
                    return {
                        matched,
                        glob: rule.glob,
                        root: rule.root,
                        index: rule.index,
                        isNeg: rule.isNeg,
                    };
                }
            }
        }

        return testRules(negRules, false) || testRules(posRules, true) || { matched: false };
    };
    return fn;
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

interface NormalizeOptions {
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
