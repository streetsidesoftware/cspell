/**
 * Inject values into a template string.
 * @param {TemplateStringsArray} template
 * @param  {...any} values
 * @returns
 */
function _inject(template: TemplateStringsArray, ...values: unknown[]): string {
    const strings = template;
    const adjValues = [];
    for (let i = 0; i < values.length; ++i) {
        const prevLines = strings[i].split('\n');
        const currLine = prevLines[prevLines.length - 1];
        const padLen = padLength(currLine);
        const padding = ' '.repeat(padLen);
        const value = `${values[i]}`;
        let pad = '';
        const valueLines = [];
        for (const line of value.split('\n')) {
            valueLines.push(pad + line);
            pad = padding;
        }
        adjValues.push(valueLines.join('\n'));
    }

    return _unindent(String.raw({ raw: strings }, ...adjValues));
}

/**
 * Calculate the padding at the start of the string.
 * @param {string} s
 * @returns {number}
 */
function padLength(s: string): number {
    return s.length - s.trimStart().length;
}

/**
 * Remove the left padding from a multi-line string.
 * @param {string} str
 * @returns {string}
 */
export function unindent(str: string): string;
/**
 * Unindent a template string.
 * @param {TemplateStringsArray} template
 * @param  {...any} values
 * @returns
 */
export function unindent(template: TemplateStringsArray, ...values: unknown[]): string;
export function unindent(template: TemplateStringsArray | string, ...values: unknown[]): string {
    if (typeof template === 'string') {
        return _unindent(template);
    }
    return _inject(template, ...values);
}

/**
 * Remove the left padding from a multi-line string.
 * @param {string} str
 * @returns {string}
 */
function _unindent(str: string): string {
    const lines = str.split('\n');
    let curPad = str.length;
    for (const line of lines) {
        if (!line.trim()) continue;
        curPad = Math.min(curPad, padLength(line));
    }

    return lines.map((line) => line.slice(curPad)).join('\n');
}
