export interface Options {
    begin: string;
    end: string;
    sep: string;
}

function expand(
    pattern: string,
    options: Options = { begin: '(', end: ')', sep: '|' },
    start = 0,
): { parts: string[]; idx: number } {
    const len = pattern.length;
    const parts: string[] = [];
    function push(word: string | string[]) {
        if (Array.isArray(word)) {
            parts.push(...word);
        } else {
            parts.push(word);
        }
    }
    let i = start;
    let curWord: string | string[] = '';
    while (i < len) {
        const ch = pattern[i++];
        if (ch === options.end) {
            break;
        }
        if (ch === options.begin) {
            const nested = expand(pattern, options, i);
            i = nested.idx;
            curWord = nested.parts.flatMap((p) => (Array.isArray(curWord) ? curWord.map((w) => w + p) : [curWord + p]));
            continue;
        }
        if (ch === options.sep) {
            push(curWord);
            curWord = '';
            continue;
        }
        curWord = Array.isArray(curWord) ? curWord.map((w) => w + ch) : curWord + ch;
    }
    push(curWord);
    return { parts, idx: i };
}

export function expandBraces(pattern: string, options: Options = { begin: '(', end: ')', sep: '|' }): string[] {
    return expand(pattern, options).parts;
}
