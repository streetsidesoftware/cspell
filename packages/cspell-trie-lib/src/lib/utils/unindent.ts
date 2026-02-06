/**
 * Inject values into a template string.
 */
export function inject(template: TemplateStringsArray, ...values: unknown[]): string {
    const adjValues = [];
    for (let i = 0; i < values.length; ++i) {
        const padding = calcPadding(template, i);
        const value = `${values[i]}`;
        let pad = '';
        const valueLines = [];
        for (const line of value.split('\n')) {
            valueLines.push(pad + line);
            pad = padding;
        }
        adjValues.push(valueLines.join('\n'));
    }

    return unindent(template, ...adjValues);
}

function calcPadding(template: TemplateStringsArray, pos: number): string {
    // find the start of the current line
    while (pos > 0 && !template[pos].includes('\n')) {
        --pos;
    }
    const prevLines = template[pos].split('\n');
    const currLine = prevLines[prevLines.length - 1];
    const padLen = padLength(currLine);
    const padding = currLine.slice(0, padLen);
    return padding;
}

/**
 * Calculate the padding at the start of the string.
 */
function padLength(s: string): number {
    return s.length - s.trimStart().length;
}

export function unindent(str: string): string;
export function unindent(str: TemplateStringsArray, ...values: unknown[]): string;
export function unindent(str: TemplateStringsArray | string, ...values: unknown[]): string {
    const s = typeof str === 'string' ? str : String.raw({ raw: str }, ...values);
    return _unindent(s);
}

/**
 * Remove the left padding from a multi-line string.
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
