import mm = require('micromatch');
import * as Path from 'path';
import { normalizeGlobPatterns, doesRootContainPath, normalizeGlobToRoot } from './globHelper';
import { PathInterface, GlobMatch, GlobPattern, GlobPatternWithRoot } from './GlobMatcherTypes';

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
    readonly patternsNormalizedToRoot: GlobPatternWithRoot[];
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
        const globPatterns = normalizeGlobPatterns(patterns, this.options);
        this.patternsNormalizedToRoot = globPatterns
            .map((g) => normalizeGlobToRoot(g, normalizedRoot, nodePath))
            // Only keep globs that do not match the root when using exclude mode.
            .filter((g) => nodePath.relative(g.root, normalizedRoot) === '');

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
    pattern: GlobPatternWithRoot;
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
        .map((pattern, index) => ({ pattern, index }))
        .filter((r) => !!r.pattern.glob)
        .filter((r) => !r.pattern.glob.startsWith('#'))
        .map(({ pattern, index }) => {
            const matchNeg = pattern.glob.match(/^!/);
            const glob = pattern.glob.replace(/^!/, '');
            const isNeg = (matchNeg && matchNeg[0].length & 1 && true) || false;
            const reg = mm.makeRe(glob, { dot: options.dot });
            const fn = (filename: string) => {
                const match = filename.match(reg);
                return !!match;
            };
            return { pattern, index, isNeg, fn, reg };
        });
    const negRules = rules.filter((r) => r.isNeg);
    const posRules = rules.filter((r) => !r.isNeg);
    const fn: GlobMatchFn = (filename: string) => {
        filename = path.resolve(path.normalize(filename));

        function testRules(rules: GlobRule[], matched: boolean): GlobMatch | undefined {
            for (const rule of rules) {
                const pattern = rule.pattern;
                const root = pattern.root;
                if (!doesRootContainPath(root, filename, path)) {
                    continue;
                }
                const relName = path.relative(root, filename);
                const fname = path.sep === '\\' ? relName.replace(/\\/g, '/') : relName;
                if (rule.fn(fname)) {
                    return {
                        matched,
                        glob: pattern.glob,
                        root,
                        pattern,
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
