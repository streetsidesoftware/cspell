"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mm = require("micromatch");
// cspell:ignore fname
class GlobMatcher {
    constructor(patterns, root) {
        this.patterns = patterns;
        this.root = root;
        this.matcher = buildMatcherFn(patterns, root);
    }
    match(filename) {
        return this.matcher(filename);
    }
}
exports.GlobMatcher = GlobMatcher;
/**
 * This function attempts to emulate .gitignore functionality as much as possible.
 * @param patterns
 * @param root
 */
function buildMatcherFn(patterns, root) {
    const r = (root || '').replace(/\/$/, '');
    const patternsEx = patterns.map(p => {
        p = p.trimLeft();
        const matchNeg = p.match(/^!+/);
        const neg = matchNeg && (matchNeg[0].length & 1) && true || false;
        const pattern = mutations.reduce((p, [regex, replace]) => p.replace(regex, replace), p);
        const reg = mm.makeRe(pattern);
        const fn = (filename) => {
            const match = filename.match(reg);
            return !!match;
        };
        return { neg, fn };
    });
    const negFns = patternsEx.filter(pat => pat.neg).map(pat => pat.fn);
    const fns = patternsEx.filter(pat => !pat.neg).map(pat => pat.fn);
    return (filename) => {
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
    };
}
const mutations = [
    [/^!+/, ''],
    [/^[^/#][^/]*$/, '**/{$&,$&/**}',],
    [/\/$/, '$&**',],
    [/^(([^/*])|([*][^*])).*[/]/, '/$&',],
];
//# sourceMappingURL=GlobMatcher.js.map