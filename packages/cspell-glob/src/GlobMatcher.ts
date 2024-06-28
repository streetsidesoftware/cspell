import * as Path from 'node:path';

import { FileUrlBuilder } from '@cspell/url';
import mm from 'micromatch';

import { GlobPatterns, isRelativeValueNested, normalizeGlobPatterns, normalizeGlobToRoot } from './globHelper.js';
import type {
    GlobMatch,
    GlobPattern,
    GlobPatternNormalized,
    GlobPatternWithRoot,
    PathInterface,
} from './GlobMatcherTypes.js';

// cspell:ignore fname

type Optional<T> = {
    [P in keyof T]?: T[P] | undefined;
};

export type GlobMatchOptions = Optional<NormalizedGlobMatchOptions>;

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
     * The directory to use as the current working directory.
     * @default: process.cwd();
     */
    cwd: string;

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

    /**
     * Disable brace matching, so that `{a,b}` and `{1..3}` would be treated as literal characters.
     *
     * @default false
     */
    nobrace?: boolean | undefined; // cspell:ignore nobrace
}

export class GlobMatcher {
    /**
     * @param filename full path of file to match against.
     * @returns a GlobMatch - information about the match.
     */
    readonly matchEx: (filename: string) => GlobMatch;
    readonly path: PathInterface;
    readonly patterns: GlobPatternWithRoot[];
    readonly patternsNormalizedToRoot: GlobPatternNormalized[];
    readonly root: string | URL;
    readonly dot: boolean;
    readonly options: NormalizedGlobMatchOptions;

    /**
     * Construct a `.gitignore` emulator
     * @param patterns - the contents of a `.gitignore` style file or an array of individual glob rules.
     * @param root - the working directory
     */
    constructor(patterns: GlobPattern | GlobPattern[], root?: string | URL, nodePath?: PathInterface);

    /**
     * Construct a `.gitignore` emulator
     * @param patterns - the contents of a `.gitignore` style file or an array of individual glob rules.
     * @param options - to set the root and other options
     */
    constructor(patterns: GlobPattern | GlobPattern[], options?: GlobMatchOptions);
    constructor(patterns: GlobPattern | GlobPattern[], rootOrOptions?: string | URL | GlobMatchOptions);

    constructor(
        patterns: GlobPattern | GlobPattern[],
        rootOrOptions?: string | URL | GlobMatchOptions,
        _nodePath?: PathInterface,
    ) {
        const options =
            typeof rootOrOptions === 'string' || rootOrOptions instanceof URL
                ? { root: rootOrOptions.toString() }
                : rootOrOptions ?? {};
        const mode = options.mode ?? 'exclude';
        const isExcludeMode = mode !== 'include';
        const nodePath = options.nodePath ?? _nodePath ?? Path;
        this.path = nodePath;
        const cwd = options.cwd ?? nodePath.resolve();
        const dot = options.dot ?? isExcludeMode;
        const nested = options.nested ?? isExcludeMode;
        const nobrace = options.nobrace;
        const root = options.root ?? nodePath.resolve();
        const builder = new FileUrlBuilder({ path: nodePath });

        const rootURL = builder.toFileDirURL(root);
        const normalizedRoot = builder.urlToFilePathOrHref(rootURL);

        this.options = { root: normalizedRoot, dot, nodePath, nested, mode, nobrace, cwd };

        patterns = Array.isArray(patterns)
            ? patterns
            : typeof patterns === 'string'
              ? patterns.split(/\r?\n/g)
              : [patterns];
        const globPatterns = normalizeGlobPatterns(patterns, this.options);
        this.patternsNormalizedToRoot = globPatterns
            .map((g) => normalizeGlobToRoot(g, normalizedRoot, nodePath))
            // Only keep globs that do not match the root when using exclude mode.
            .filter((g) => builder.relative(builder.toFileDirURL(g.root), rootURL) === '');

        this.patterns = globPatterns;
        this.root = normalizedRoot;
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
    /** The pattern */
    pattern: GlobPatternWithRoot;
    /**
     * Index of the glob in the list.
     */
    index: number;
    /**
     * Is a negated pattern
     */
    isNeg: boolean;
    /**
     * the glob converted to a regexp.
     */
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
    const { nodePath, dot, nobrace } = options;
    const builder = new FileUrlBuilder({ path: nodePath });
    const makeReOptions = { dot, nobrace };
    const suffixDir = GlobPatterns.suffixDir;
    const rules: GlobRule[] = patterns
        .map((pattern, index) => ({ pattern, index }))
        .filter((r) => !!r.pattern.glob)
        .filter((r) => !r.pattern.glob.startsWith('#'))
        .map(({ pattern, index }) => {
            const matchNeg = pattern.glob.match(/^!/);
            const glob = pattern.glob.replace(/^!/, '');
            const isNeg = (matchNeg && matchNeg[0].length & 1 && true) || false;
            const reg = mm.makeRe(glob, makeReOptions);
            const fn = pattern.glob.endsWith(suffixDir)
                ? (filename: string) => {
                      // Note: this is a hack to get around the limitations of globs.
                      // We want to match a filename with a trailing slash, but micromatch does not support it.
                      // So it is necessary to pretend that the filename has a space at the end.
                      return reg.test(filename) || (filename.endsWith('/') && reg.test(filename + ' '));
                  }
                : (filename: string) => {
                      return reg.test(filename);
                  };
            return { pattern, index, isNeg, fn, reg };
        });
    const negRules = rules.filter((r) => r.isNeg);
    const posRules = rules.filter((r) => !r.isNeg);

    // const negRegEx = negRules.map((r) => r.reg).map((r) => r.toString());
    // const posRegEx = posRules.map((r) => r.reg).map((r) => r.toString());

    // console.error('buildMatcherFn %o', { negRegEx, posRegEx, stack: new Error().stack });

    // const negReg = joinRegExp(negRegEx);
    // const posReg = joinRegExp(posRegEx);

    const fn: GlobMatchFn = (filename: string) => {
        const fileUrl = builder.toFileURL(filename);
        const relFilePathname = builder.relative(new URL('file:///'), fileUrl);
        let lastRoot = new URL('placeHolder://');
        let lastRel = '';

        const mapRoots = new Map<string, URL>();

        function rootToUrl(root: string): URL {
            const found = mapRoots.get(root);
            if (found) return found;
            const url = builder.toFileDirURL(root);
            mapRoots.set(root, url);
            return url;
        }

        function relativeToRoot(root: URL) {
            if (root.href !== lastRoot.href) {
                lastRoot = root;
                lastRel = builder.relative(root, fileUrl);
            }
            return lastRel;
        }

        function testRules(rules: GlobRule[], matched: boolean): GlobMatch | undefined {
            for (const rule of rules) {
                const pattern = rule.pattern;
                const root = pattern.root;
                const rootURL = rootToUrl(root);
                const isRelPat = !pattern.isGlobalPattern;
                const relPathToFile = relativeToRoot(rootURL);
                if (isRelPat && !isRelativeValueNested(relPathToFile)) {
                    continue;
                }
                const fname = isRelPat ? relPathToFile : relFilePathname;
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

// function _joinRegExp(patterns: RegExp[]): RegExp | undefined {
//     if (!patterns.length) {
//         return undefined;
//     }
//     const joined = patterns.map((p) => `(?:${p.source})`).join('|');
//     return new RegExp(joined);
// }
