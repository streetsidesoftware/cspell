// cspell:ignore gimuxy

export const regExMatchRegExParts = /^\s*\/([\s\S]*?)\/([gimuxy]*)\s*$/;

export function stringToRegExp(pattern: string | RegExp, defaultFlags = '', forceFlags = ''): RegExp | undefined {
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
            const flags = [...new Set(forceFlags + flag)].join('').replaceAll(/[^gimuy]/g, '');
            const regex = new RegExp(regPattern, flags);
            return regex;
        }
    } catch {
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
