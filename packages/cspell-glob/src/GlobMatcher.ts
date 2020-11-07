import mm = require('micromatch');
import * as path from 'path';

// cspell:ignore fname

export type PathInterface = typeof path.posix;

export type GlobMatch = GlobMatchRule | GlobMatchNoRule;

export interface GlobMatchRule {
    matched: boolean;
    glob: string;
    index: number;
    isNeg: boolean;
}

export interface GlobMatchNoRule {
    matched: false;
}

export class GlobMatcher {
    /**
     * @param filename full path of file to match against.
     * @returns a GlobMatch - information about the match.
     */
    readonly matchEx: (filename: string) => GlobMatch;
    readonly path: PathInterface;
    /**
     * Construct a `.gitignore` emulator
     * @param patterns the contents of a `.gitignore` style file or an array of individual glob rules.
     * @param root the working directory
     */
    constructor(readonly patterns: string | string[], readonly root?: string, nodePath?: PathInterface) {
        this.path = nodePath ?? path;
        this.matchEx = buildMatcherFn(this.path, patterns, root);
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
 * If filename is absolute and not contained within the root, it will be tested as is.
 *
 * @param patterns the contents of a .gitignore style file or an array of individual glob rules.
 * @param root the working directory
 * @returns a function given a filename returns true if it matches.
 */
function buildMatcherFn(path: PathInterface, patterns: string | string[], root?: string): GlobMatchFn {
    if (typeof patterns == 'string') {
        patterns = patterns.split(/\r?\n/g);
    }
    const dirRoot = path.normalize(root || '/');
    const rules: GlobRule[] = patterns
        .map((p) => p.trim())
        .map((p, index) => ({ glob: p, index }))
        .filter((r) => !!r.glob)
        .map(({ glob, index }) => {
            const matchNeg = glob.match(/^!+/);
            const isNeg = (matchNeg && matchNeg[0].length & 1 && true) || false;
            const pattern = mutations.reduce((p, [regex, replace]) => p.replace(regex, replace), glob);
            const reg = mm.makeRe(pattern);
            const fn = (filename: string) => {
                const match = filename.match(reg);
                return !!match;
            };
            return { glob, index, isNeg, fn, reg };
        });
    const negRules = rules.filter((r) => r.isNeg);
    const posRules = rules.filter((r) => !r.isNeg);
    const fn: GlobMatchFn = (filename: string) => {
        filename = path.normalize(filename);
        const offset = dirRoot === filename.slice(0, dirRoot.length) ? dirRoot.length : 0;
        const lName = filename.slice(offset);
        const filePath = path.parse(lName);
        const relPath = path.join(filePath.dir.slice(filePath.root.length), filePath.base);
        const fname = relPath.split(path.sep).join('/');

        for (const rule of negRules) {
            if (rule.fn(fname)) {
                return {
                    matched: false,
                    glob: rule.glob,
                    index: rule.index,
                    isNeg: rule.isNeg,
                };
            }
        }

        for (const rule of posRules) {
            if (rule.fn(fname)) {
                return {
                    matched: true,
                    glob: rule.glob,
                    index: rule.index,
                    isNeg: rule.isNeg,
                };
            }
        }
        return { matched: false };
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
