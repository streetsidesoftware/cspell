import { URL_SITE_PKG } from './constants.mts';

/**
 * Add padding to each line of a string.
 * @param str - The multi-line string to left pad.
 * @param padding - The padding to add to each line except for the first.
 * @param firstLinePadding - The padding to add to the first line.
 * @returns
 */
export function padLines(str: string, padding: string = '', firstLinePadding: string = ''): string {
    let pad = firstLinePadding;
    const lines: string[] = [];
    for (const line of str.split('\n')) {
        lines.push(pad + line);
        pad = padding;
    }

    return lines.join('\n');
}

/**
 * Inject values into a template string.
 */
export function inject(template: TemplateStringsArray, ...values: unknown[]): string {
    const strings = template;
    const adjValues: string[] = [];
    for (let i = 0; i < values.length; ++i) {
        const prevLines = strings[i].split('\n');
        const currLine = prevLines[prevLines.length - 1];
        const padLen = padLength(currLine);
        const padding = ' '.repeat(padLen);
        const value = `${values[i]}`;
        let pad = '';
        const valueLines: string[] = [];
        for (const line of value.split('\n')) {
            valueLines.push(pad + line);
            pad = padding;
        }
        adjValues.push(valueLines.join('\n'));
    }

    return unindent(String.raw({ raw: strings }, ...adjValues));
}

/**
 * Create a markdown table.
 */
export function createTable(headers: string[], rows: string[][]): string {
    const colWidths: number[] = [];

    for (const row of [headers, ...rows]) {
        row.forEach((col, i) => {
            colWidths[i] = Math.max(colWidths[i] || 0, [...col].length);
        });
    }

    const rowPlaceholders = colWidths.map(() => '');
    const sep = headers.map((_, i) => '---'.padEnd(colWidths[i], '-'));
    const table = [headers, sep, ...rows];

    return table
        .map((row) => [...row, ...rowPlaceholders.slice(row.length)])
        .map((row) => row.map((col, i) => col.padEnd(colWidths[i])))
        .map((row) => `| ${row.join(' | ')} |`)
        .join('\n');
}

/**
 * Calculate the padding at the start of the string.
 */
function padLength(s: string): number {
    return s.length - s.trimStart().length;
}

/**
 * Remove the left padding from a multi-line string.
 */
function unindent(str: string): string {
    const lines = str.split('\n');
    let curPad = str.length;
    for (const line of lines) {
        if (!line.trim()) continue;
        curPad = Math.min(curPad, padLength(line));
    }

    return lines.map((line) => line.slice(curPad)).join('\n');
}

export function relativeToUrl(url: URL | string, baseUrl: URL): string {
    const base = new URL('.', baseUrl).pathname.split('/');
    const path = new URL(url).pathname.split('/');

    let i = 0;
    for (; i < Math.min(base.length, path.length) && base[i] === path[i]; ++i) {
        // no code
    }

    let prefix = base
        .slice(i, -1)
        .map(() => '..')
        .join('/');
    prefix = prefix ? prefix + '/' : '';
    const suffix = path.slice(i).join('/');
    return prefix + suffix;
}

export function relativeToSite(url: URL | string): string {
    return relativeToUrl(url, URL_SITE_PKG);
}
