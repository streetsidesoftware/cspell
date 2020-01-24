
import path = require('path')
import mm =  require('micromatch');

// cspell:ignore fname

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
    /**
     * Construct a `.gitignore` emulator
     * @param patterns the contents of a `.gitignore` style file or an array of individual glob rules.
     * @param root the working directory
     */
    constructor(readonly patterns: string | string[], readonly root?: string) {
        this.matchEx = buildMatcherFn(patterns, root);
    }

    /**
     * Check to see if a filename matches any of the globs.
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
 * @param patterns the contents of a .gitignore style file or an array of individual glob rules.
 * @param root the working directory
 * @returns a function given a filename returns if it matches.
 */
function buildMatcherFn(patterns: string | string[], root?: string): GlobMatchFn {
    if (typeof patterns == 'string') {
        patterns = patterns.split(/\r?\n/g);
    }
    const r = (root || '').replace(/\/$/, '') as string;
    const rules: GlobRule[] = patterns
        .map(p => p.trim())
        .map((p, index) => ({ glob: p, index }))
        .filter(r => !!r.glob)
        .map(({ glob, index }) => {
            const matchNeg = glob.match(/^!+/);
            const isNeg = matchNeg && (matchNeg[0].length & 1) && true || false;
            const pattern = mutations.reduce((p, [regex, replace]) => p.replace(regex, replace), glob);
            const reg = mm.makeRe(pattern);
            const fn = (filename: string) => {
                const match = filename.match(reg);
                return !!match;
            };
            return { glob, index, isNeg, fn, reg };
        });
    const negRules = rules.filter(r => r.isNeg);
    const posRules = rules.filter(r => !r.isNeg);
    const fn: GlobMatchFn = (filename: string) => {
	// Root character is / on Unix, or single letter on Windows.
	const rootChar = path.parse(process.cwd()).root[0] 
	const prefixChars = [rootChar]

	if (process.platform === 'win32') {
	    prefixChars.push(':')
	}

	const prefix = prefixChars.join('')

	if (filename.startsWith(prefix) === false) {
	    filename = `${prefix}${filename}`
	}

	const offset = r === filename.slice(0, r.length) ? r.length : 0;
	const fname = filename.slice(offset);

        for (const rule of negRules) {
            if (rule.fn(fname)) {
                return { matched: false, glob: rule.glob, index: rule.index, isNeg: rule.isNeg };
            }
        }

        for (const rule of posRules) {
            if (rule.fn(fname)) {
                return { matched: true, glob: rule.glob, index: rule.index, isNeg: rule.isNeg };
            }
        }
        return { matched: false };
    }
    return fn;
}

type MutationsToSupportGitIgnore = [RegExp, string];

const mutations: MutationsToSupportGitIgnore[] = [
    [/^!+/, ''],                                   // remove leading !
    [/^[^/#][^/]*$/, '**/{$&,$&/**}',],            // no slashes will match files names or folders
    [/\/$/, '$&**',],                              // if it ends in a slash, make sure matches the folder
    [/^(([^/*])|([*][^*])).*[/]/, '/$&',],         // if it contains a slash, prefix with a slash
];
