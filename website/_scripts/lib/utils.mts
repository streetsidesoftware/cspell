import { URL_SITE_PKG } from './constants.mts';

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
