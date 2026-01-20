/**
 * Generate a Markdown code block, handling nested backticks.
 * @param code - the code to put in the code block
 * @param language - the language of the code block
 * @returns The generated markdown code block.
 */
export function codeBlock(code: string, language = 'text'): string {
    const foundNestedBackticks = [...matchAllUnique(code, /`+/g)].map((bt) => bt.length);
    const minLength = Math.max(2, ...foundNestedBackticks) + 1;
    const fence = '`'.repeat(minLength);
    return `${fence}${language}\n${code.replace(/\r?\n$/, '')}\n${fence}`;
}

function* matchAllText(str: string, re: RegExp): Iterable<string> {
    for (const match of str.matchAll(re)) {
        yield match[0];
    }
}

function matchAllUnique(str: string, re: RegExp): Set<string> {
    return new Set(matchAllText(str, re));
}
