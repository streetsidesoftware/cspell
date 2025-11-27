/**
 * Indent each line of a multi-line string.
 * @param str - multi-line string to left pad
 * @param padding - the padding to use for all lines except the first.
 * @param firstLinePadding - optional padding of first line.
 * @returns
 */
export function indent(str: string, padding: string, firstLinePadding: string = ''): string {
    let pad = firstLinePadding;
    const lines = [];
    for (const line of str.split('\n')) {
        lines.push(pad + line);
        pad = padding;
    }

    return lines.join('\n');
}

/**
 * Inject values into a template string while keeping indentation of multi-line values.
 * @param template - template string
 * @param values- values to inject
 * @returns the injected string
 */
export function keepIndent(template: TemplateStringsArray, ...values: unknown[]): string {
    const strings = template;
    const adjValues = [];
    for (let i = 0; i < values.length; ++i) {
        const prevLines = strings[i].split('\n');
        const currLine = prevLines[prevLines.length - 1];
        const padLen = padLength(currLine);
        const padding = ' '.repeat(padLen);
        adjValues.push(indent(`${values[i]}`, padding));
    }

    return String.raw({ raw: strings }, ...adjValues);
}

/**
 * Calculate the padding at the start of the string.
 * @param s - string to evaluate
 * @returns number of padding characters
 */
export function padLength(s: string): number {
    return s.length - s.trimStart().length;
}

/**
 * Remove the left padding from a multi-line string.
 * Multi-line strings can be provided as template values. In that case, the indentation
 * of the template is preserved.
 * @param template - template string to unindent
 * @param values - values to inject
 * @returns the unindented string
 */
export function unindent(template: TemplateStringsArray, ...values: unknown[]): string;

/**
 * Remove the left padding from a multi-line string.
 * @param str - multi-line string to unindent
 * @returns the unindented string
 */
export function unindent(str: string): string;

export function unindent(templateOrString: TemplateStringsArray | string, ...values: unknown[]): string {
    const str = typeof templateOrString === 'string' ? templateOrString : keepIndent(templateOrString, ...values);
    return unindentString(str);
}

function unindentString(str: string): string {
    const lines = str.split('\n');
    let curPad = str.length;
    for (const line of lines) {
        if (!line.trim()) continue;
        curPad = Math.min(curPad, padLength(line));
    }

    return lines.map((line) => line.slice(curPad)).join('\n');
}
