/**
 * Generate a Markdown code block, handling nested backticks.
 * @param code - the code to put in the code block
 * @param language - the language of the code block
 * @returns The generated markdown code block.
 */
export function codeBlock(code: string, language = 'text'): string {
    const foundNestedBackticks = new Set([...code.matchAll(/`+/g)].map((m) => m[0].length));
    const minLength = Math.max(2, ...[...foundNestedBackticks]) + 1;
    const fence = '`'.repeat(minLength);
    return `${fence}${language}\n${code.replace(/\r?\n$/, '')}\n${fence}`;
}
