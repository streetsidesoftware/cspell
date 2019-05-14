
import mm =  require('micromatch');

// cspell:ignore fname

export class GlobMatcher {
    readonly matcher: (filename: string) => boolean;
    /**
     * Construct a `.gitignore` emulator
     * @param patterns the contents of a `.gitignore` style file or an array of individual glob rules.
     * @param root the working directory
     */
    constructor(readonly patterns: string | string[], readonly root?: string) {
        this.matcher = buildMatcherFn(patterns, root);
    }

    match(filename: string): boolean {
        return this.matcher(filename);
    }
}

/**
 * This function attempts to emulate .gitignore functionality as much as possible.
 * @param patterns the contents of a .gitignore style file or an array of individual glob rules.
 * @param root the working directory
 * @returns a function given a filename returns if it matches.
 */
function buildMatcherFn(patterns: string | string[], root?: string): (filename: string) => boolean {
    if (typeof patterns == 'string') {
        patterns = patterns.split(/\r?\n/g);
    }
    const r = (root || '').replace(/\/$/, '') as string;
    const patternsEx = patterns
    .map(p => p.trim())
    .filter(p => !!p)
    .map(p => {
        p = p.trimLeft();
        const matchNeg = p.match(/^!+/);
        const neg = matchNeg && (matchNeg[0].length & 1) && true || false;
        const pattern = mutations.reduce((p, [regex, replace]) => p.replace(regex, replace), p);
        const reg = mm.makeRe(pattern);
        const fn = (filename: string) => {
            const match = filename.match(reg);
            return !!match;
        };
        return { neg, fn };
    });
    const negFns = patternsEx.filter(pat => pat.neg).map(pat => pat.fn);
    const fns = patternsEx.filter(pat => !pat.neg).map(pat => pat.fn);
    return (filename: string) => {
        filename = filename.replace(/^[^/]/, '/$&');
        const offset = r === filename.slice(0, r.length) ? r.length : 0;
        const fname = filename.slice(offset);

        for (const negFn of negFns) {
            if (negFn(fname)) {
                return false;
            }
        }

        for (const fn of fns) {
            if (fn(fname)) {
                return true;
            }
        }
        return false;
    }
}

type MutationsToSupportGitIgnore = [RegExp, string];

const mutations: MutationsToSupportGitIgnore[] = [
    [/^!+/, ''],                                   // remove leading !
    [/^[^/#][^/]*$/, '**/{$&,$&/**}',],            // no slashes will match files names or folders
    [/\/$/, '$&**',],                              // if it ends in a slash, make sure matches the folder
    [/^(([^/*])|([*][^*])).*[/]/, '/$&',],         // if it contains a slash, prefix with a slash
];
