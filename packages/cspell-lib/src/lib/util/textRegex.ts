// cspell:ignore ings ning gimuy anrvtbf gimuxy

export const regExLines = /.*(\r?\n|$)/g;
export const regExUpperSOrIng = /([\p{Lu}\p{M}]+\\?['’]?(?:s|ing|ies|es|ings|ed|ning))(?!\p{Ll})/gu;
export const regExSplitWords = /(\p{Ll}\p{M}?)(\p{Lu})/gu;
export const regExSplitWords2 = /(\p{Lu}\p{M}?)(\p{Lu}\p{M}?\p{Ll})/gu;
export const regExWords = /\p{L}\p{M}?(?:(?:\\?['’])?\p{L}\p{M}?)*/gu;
export const regExWordsAndDigits = /(?:\d+)?[\p{L}\p{M}_'’-](?:(?:\\?['’])?[\p{L}\p{M}\w'’-])*/gu;
export const regExIgnoreCharacters = /[\p{sc=Hiragana}\p{sc=Han}\p{sc=Katakana}\u30A0-\u30FF\p{sc=Hangul}]/gu;
export const regExFirstUpper = /^\p{Lu}\p{M}?\p{Ll}+$/u;
export const regExAllUpper = /^(?:\p{Lu}\p{M}?)+$/u;
export const regExAllLower = /^(?:\p{Ll}\p{M}?)+$/u;
export const regExPossibleWordBreaks = /[-_’']/g;
export const regExMatchRegExParts = /^\s*\/([\s\S]*?)\/([gimuxy]*)\s*$/;
export const regExAccents = /\p{M}/gu;
export const regExEscapeCharacters = /(?<=\\)[anrvtbf]/gi;
/** Matches against leading `'` or `{single letter}'` */
export const regExDanglingQuote = /(?<=(?:^|(?!\p{M})\P{L})(?:\p{L}\p{M}?)?)[']/gu;
/** Match tailing endings after CAPS words */
export const regExTrailingEndings = /(?<=(?:\p{Lu}\p{M}?){2})['’]?(?:s|d|ings?|ies|e[ds]?|ning|th|nth)(?!\p{Ll})/gu;

export function stringToRegExp(pattern: string | RegExp, defaultFlags = 'gimu', forceFlags = 'g'): RegExp | undefined {
    if (pattern instanceof RegExp) {
        return pattern;
    }
    try {
        const [, pat, flag] = [
            ...(pattern.match(regExMatchRegExParts) || ['', pattern.trim(), defaultFlags]),
            forceFlags,
        ];
        if (pat) {
            const regPattern = flag.includes('x') ? removeVerboseFromRegExp(pat) : pat;
            // Make sure the flags are unique.
            const flags = [...new Set(forceFlags + flag)].join('').replace(/[^gimuy]/g, '');
            const regex = new RegExp(regPattern, flags);
            return regex;
        }
    } catch (e) {
        /* empty */
    }
    return undefined;
}

interface ReduceResults {
    /** current offset into the pattern */
    idx: number;
    /** the cleaned RegExp */
    result: string;
}

type Reducer = (acc: ReduceResults) => ReduceResults | undefined;

const SPACES: Record<string, true | undefined> = {
    ' ': true,
    '\n': true,
    '\r': true,
    '\t': true,
};

/**
 * Remove all whitespace and comments from a regexp string. The format follows Pythons Verbose.
 * Note: this is a best attempt. Special cases for comments: `#` and spaces should be proceeded with a `\`
 *
 * All space must be proceeded by a `\` or in a character class `[]`
 *
 * @param pattern - the pattern to clean
 */
function removeVerboseFromRegExp(pattern: string): string {
    function escape(acc: ReduceResults) {
        const char = pattern[acc.idx];
        if (char !== '\\') return undefined;
        const next = pattern[++acc.idx];
        acc.idx++;
        if (next === '#') {
            acc.result += '#';
            return acc;
        }
        if (!(next in SPACES)) {
            acc.result += '\\' + next;
            return acc;
        }
        acc.result += next;
        if (next === '\r' && pattern[acc.idx] === '\n') {
            acc.result += '\n';
            acc.idx++;
        }
        return acc;
    }

    function braces(acc: ReduceResults) {
        const char = pattern[acc.idx];
        if (char !== '[') return undefined;
        acc.result += char;
        acc.idx++;
        let escCount = 0;
        while (acc.idx < pattern.length) {
            const char = pattern[acc.idx];
            acc.result += char;
            acc.idx++;
            if (char === ']' && !(escCount & 1)) break;
            escCount = char === '\\' ? escCount + 1 : 0;
        }
        return acc;
    }

    function spaces(acc: ReduceResults) {
        const char = pattern[acc.idx];
        if (!(char in SPACES)) return undefined;
        acc.idx++;
        return acc;
    }

    function comments(acc: ReduceResults) {
        const char = pattern[acc.idx];
        if (char !== '#') return undefined;
        while (acc.idx < pattern.length && pattern[acc.idx] !== '\n') {
            acc.idx++;
        }
        return acc;
    }

    function copy(acc: ReduceResults) {
        const char = pattern[acc.idx++];
        acc.result += char;
        return acc;
    }

    const reducers: Reducer[] = [escape, braces, spaces, comments, copy];

    const result: ReduceResults = { idx: 0, result: '' };

    while (result.idx < pattern.length) {
        for (const r of reducers) {
            if (r(result)) break;
        }
    }

    return result.result;
}
