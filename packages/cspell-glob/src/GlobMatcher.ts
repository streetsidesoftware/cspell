import mm = require('micromatch');
import * as Path from 'path';

// cspell:ignore fname

export interface PathInterface {
    normalize(p: string): string;
    join(...paths: string[]): string;
    resolve(...paths: string[]): string;
    relative(from: string, to: string): string;
    isAbsolute(p: string): boolean;
    sep: string;
}

export type GlobMatch = GlobMatchRule | GlobMatchNoRule;

export interface GlobMatchRule {
    matched: boolean;
    glob: string;
    root: string;
    index: number;
    isNeg: boolean;
}

export interface GlobMatchNoRule {
    matched: false;
}

export type GlobMatchOptions = Partial<NormalizedGlobMatchOptions>;

interface NormalizedGlobMatchOptions {
    root: string;
    dot: boolean;
    nodePath: PathInterface;
}

export type GlobPattern = SimpleGlobPattern | GlobPatternWithRoot | GlobPatternWithOptionalRoot;

export type SimpleGlobPattern = string;
export interface GlobPatternWithOptionalRoot {
    glob: string;
    root?: string;
}

export interface GlobPatternWithRoot extends GlobPatternWithOptionalRoot {
    root: string;
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

        const { root = _nodePath.resolve(), dot = false, nodePath = _nodePath } = options;

        const normalizedRoot = nodePath.resolve(nodePath.normalize(root));
        this.options = { root: normalizedRoot, dot, nodePath };

        patterns = Array.isArray(patterns)
            ? patterns
            : typeof patterns === 'string'
            ? patterns.split(/\r?\n/g)
            : [patterns];
        const globPatterns = patterns.map((p) => toGlobPatternWithRoot(p, normalizedRoot));

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
            const matchNeg = glob.match(/^!+/);
            const isNeg = (matchNeg && matchNeg[0].length & 1 && true) || false;
            const pattern = mutations.reduce((p, [regex, replace]) => p.replace(regex, replace), glob);
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
        filename = path.normalize(filename);

        const absPath = path.resolve(filename);
        const useAbs = path.isAbsolute(filename) || filename.startsWith('..');

        function testRules(rules: GlobRule[], matched: boolean): GlobMatch | undefined {
            for (const rule of rules) {
                const relPath = useAbs ? path.relative(rule.root, absPath) : filename;
                if (relPath.startsWith('..')) {
                    continue;
                }
                const fname = relPath.split(path.sep).join('/');
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

const mutations: MutationsToSupportGitIgnore[] = [
    [/^!+/, ''], // remove leading !
    [/^[^/#][^/]*$/, '**/{$&,$&/**}'], // no slashes will match files names or folders
    [/^\/(?!\/)/, ''], // remove leading slash to match from the root
    [/\/$/, '$&**'], // if it ends in a slash, make sure matches the folder
];

export function isGlobPatternWithOptionalRoot(g: GlobPattern): g is GlobPatternWithOptionalRoot {
    return typeof g !== 'string' && typeof g.glob === 'string';
}

export function isGlobPatternWithRoot(g: GlobPatternWithRoot | GlobPatternWithOptionalRoot): g is GlobPatternWithRoot {
    return !!g.root;
}

function toGlobPatternWithRoot(g: GlobPattern, root: string): GlobPatternWithRoot {
    if (!isGlobPatternWithOptionalRoot(g)) {
        return {
            glob: g.trim(),
            root,
        };
    }

    return isGlobPatternWithRoot(g) ? g : { ...g, root };
}
